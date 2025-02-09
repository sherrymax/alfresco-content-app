/*!
 * @license
 * Alfresco Example Content Application
 *
 * Copyright (C) 2005 - 2020 Alfresco Software Limited
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail.  Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

import {
  AdminActions,
  LoginPage,
  BrowsingPage,
  SITE_VISIBILITY,
  SITE_ROLES,
  RepoClient,
  CreateOrEditFolderDialog,
  Utils,
  clearTextWithBackspace
} from '@alfresco/aca-testing-shared';
import { BrowserActions } from '@alfresco/adf-testing';

describe('Edit folder', () => {
  const username = `user-${Utils.random()}`;

  const parent = `parent-${Utils.random()}`;
  let parentId: string;
  const folderName = `folder-${Utils.random()}`;
  const folderDescription = 'my folder description';

  const folderNameToEdit = `folder-${Utils.random()}`;
  const duplicateFolderName = `folder-${Utils.random()}`;

  const folderNameEdited = `folder-renamed-${Utils.random()}`;
  const folderDescriptionEdited = 'description edited';

  const sitePrivate = `site-private-${Utils.random()}`;
  const siteName = `site-${Utils.random()}`;

  const folderSite = `folder-site-${Utils.random()}`;
  const duplicateFolderSite = `folder-${Utils.random()}`;
  let docLibUserSite: string;

  const folderFavorite = `folder-fav-${Utils.random()}`;
  let folderFavoriteId: string;
  const folderFavoriteToEdit = `folder-fav-${Utils.random()}`;
  let folderFavoriteToEditId: string;
  const folderFavoriteDuplicate = `folder-fav-${Utils.random()}`;
  let folderFavoriteDuplicateId: string;

  const searchRandom = Utils.random();
  const folderSearch = `folder-search-${searchRandom}`;
  const folderSearchToEdit = `folder-search-to-edit-${searchRandom}`;
  let folderSearchToEditId: string;
  const folderSearchDuplicate = `folder-search-duplicate-${searchRandom}`;

  const apis = {
    user: new RepoClient(username, username)
  };

  const loginPage = new LoginPage();
  const page = new BrowsingPage();
  const editDialog = new CreateOrEditFolderDialog();
  const { dataTable, toolbar } = page;

  const adminApiActions = new AdminActions();

  beforeAll(async () => {
    await adminApiActions.createUser({ username });

    await adminApiActions.sites.createSite(sitePrivate, SITE_VISIBILITY.PRIVATE);
    const docLibId = await adminApiActions.sites.getDocLibId(sitePrivate);
    await adminApiActions.nodes.createFolder(folderName, docLibId);
    await adminApiActions.sites.addSiteMember(sitePrivate, username, SITE_ROLES.SITE_CONSUMER.ROLE);

    parentId = (await apis.user.nodes.createFolder(parent)).entry.id;
    await apis.user.nodes.createFolder(folderName, parentId, '', folderDescription);
    await apis.user.nodes.createFolder(folderNameToEdit, parentId);
    await apis.user.nodes.createFolder(duplicateFolderName, parentId);

    await apis.user.sites.createSite(siteName);
    docLibUserSite = await apis.user.sites.getDocLibId(siteName);
    await apis.user.nodes.createFolder(folderSite, docLibUserSite);
    await apis.user.nodes.createFolder(duplicateFolderSite, docLibUserSite);

    folderFavoriteId = (await apis.user.nodes.createFolder(folderFavorite)).entry.id;
    folderFavoriteToEditId = (await apis.user.nodes.createFolder(folderFavoriteToEdit)).entry.id;
    folderFavoriteDuplicateId = (await apis.user.nodes.createFolder(folderFavoriteDuplicate)).entry.id;

    await apis.user.nodes.createFolder(folderSearch);
    folderSearchToEditId = (await apis.user.nodes.createFolder(folderSearchToEdit)).entry.id;
    await apis.user.nodes.createFolder(folderSearchDuplicate);

    await apis.user.favorites.addFavoriteById('folder', folderFavoriteId);
    await apis.user.favorites.addFavoriteById('folder', folderFavoriteToEditId);
    await apis.user.favorites.addFavoriteById('folder', folderFavoriteDuplicateId);

    await apis.user.search.waitForNodes(searchRandom, { expect: 3 });

    await loginPage.loginWith(username);
  });

  afterAll(async () => {
    await adminApiActions.sites.deleteSite(sitePrivate);
    await apis.user.sites.deleteSite(siteName);
    await apis.user.nodes.deleteNodesById([parentId, folderFavoriteToEditId, folderFavoriteDuplicateId, folderSearchToEditId]);
  });

  beforeEach(async () => {
    await Utils.pressEscape();
  });

  afterEach(async () => {
    await page.closeOpenDialogs();
  });

  it('[C216331] dialog UI defaults', async () => {
    await dataTable.doubleClickOnRowByName(parent);
    await dataTable.selectItem(folderName);
    await toolbar.openMoreMenu();
    await BrowserActions.click(toolbar.menu.editFolderAction);

    expect(await editDialog.getDialogTitle()).toEqual('Edit folder');
    expect(await editDialog.getName()).toBe(folderName);
    expect(await editDialog.getDescription()).toBe(folderDescription);
    expect(await editDialog.isUpdateButtonEnabled()).toBe(true, 'upload button is not enabled');
    expect(await editDialog.isCancelButtonEnabled()).toBe(true, 'cancel button is not enabled');
  });

  describe('on Personal Files', () => {
    beforeEach(async () => {
      await page.clickPersonalFilesAndWait();
      await dataTable.doubleClickOnRowByName(parent);
      await dataTable.waitForHeader();
    });

    it('[C216335] properties are modified when pressing OK', async () => {
      await dataTable.selectItem(folderNameToEdit);
      await toolbar.openMoreMenu();
      await BrowserActions.click(toolbar.menu.editFolderAction);
      await editDialog.waitForDialogToOpen();
      await editDialog.enterDescription(folderDescriptionEdited);
      await editDialog.enterName(folderNameEdited);
      await BrowserActions.click(editDialog.updateButton);
      await editDialog.waitForDialogToClose();
      await dataTable.waitForHeader();

      expect(await dataTable.isItemPresent(folderNameEdited)).toBe(true, 'Folder not displayed');
      const desc = await apis.user.nodes.getNodeDescription(folderNameEdited, parentId);
      expect(desc).toEqual(folderDescriptionEdited);
    });

    it('[C216332] with empty folder name', async () => {
      await dataTable.selectItem(folderName);
      await toolbar.openMoreMenu();
      await BrowserActions.click(toolbar.menu.editFolderAction);
      await clearTextWithBackspace(editDialog.nameInput);

      expect(await editDialog.isUpdateButtonEnabled()).toBe(false, 'upload button is not enabled');
      expect(await editDialog.getValidationMessage()).toMatch('Folder name is required');
    });

    it('[C216333] with name with special characters', async () => {
      const namesWithSpecialChars = ['a*a', 'a"a', 'a<a', 'a>a', `a\\a`, 'a/a', 'a?a', 'a:a', 'a|a'];

      await dataTable.selectItem(folderName);
      await toolbar.openMoreMenu();
      await BrowserActions.click(toolbar.menu.editFolderAction);

      for (const name of namesWithSpecialChars) {
        await editDialog.enterName(name);
        expect(await editDialog.isUpdateButtonEnabled()).toBe(false, 'upload button is not disabled');
        expect(await editDialog.getValidationMessage()).toContain(`Folder name can't contain these characters`);
      }
    });

    it('[C216334] with name ending with a dot', async () => {
      await dataTable.selectItem(folderName);
      await toolbar.openMoreMenu();
      await BrowserActions.click(toolbar.menu.editFolderAction);
      await editDialog.waitForDialogToOpen();
      await editDialog.nameInput.sendKeys('.');

      expect(await editDialog.isUpdateButtonEnabled()).toBe(false, 'upload button is not enabled');
      expect(await editDialog.getValidationMessage()).toMatch(`Folder name can't end with a period .`);
    });

    it('[C216336] Cancel button', async () => {
      await dataTable.selectItem(folderName);
      await toolbar.openMoreMenu();
      await BrowserActions.click(toolbar.menu.editFolderAction);
      await editDialog.waitForDialogToOpen();
      await editDialog.clickCancel();

      expect(await editDialog.isDialogOpen()).not.toBe(true, 'dialog is not closed');
    });

    it('[C216337] with duplicate folder name', async () => {
      await dataTable.selectItem(folderName);
      await toolbar.openMoreMenu();
      await BrowserActions.click(toolbar.menu.editFolderAction);
      await editDialog.waitForDialogToOpen();
      await editDialog.enterName(duplicateFolderName);
      await BrowserActions.click(editDialog.updateButton);

      expect(await page.getSnackBarMessage()).toEqual(`There's already a folder with this name. Try a different name.`);
      expect(await editDialog.isDialogOpen()).toBe(true, 'dialog is not present');
    });

    it('[C216338] trim ending spaces', async () => {
      await dataTable.selectItem(folderName);
      await toolbar.openMoreMenu();
      await BrowserActions.click(toolbar.menu.editFolderAction);
      await editDialog.nameInput.sendKeys('   ');
      await BrowserActions.click(editDialog.updateButton);
      await editDialog.waitForDialogToClose();

      expect(await page.snackBar.isPresent()).not.toBe(true, 'notification appears');
      expect(await dataTable.isItemPresent(folderName)).toBe(true, 'Folder not displayed in list view');
    });
  });
});
