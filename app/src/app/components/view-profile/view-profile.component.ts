/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */
import { AlfrescoApiService } from '@alfresco/adf-core';
import { PeopleApi, Person } from '@alfresco/js-api';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { throwError } from 'rxjs';

@Component({
    selector: 'adf-view-profile',
    templateUrl: './view-profile.component.html',
    styleUrls: ['./view-profile.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ViewProfileComponent implements OnInit, OnDestroy{
  peopleApi: PeopleApi;

  profileForm:FormGroup;
  person_details:Person;

  general_section_dropdown:boolean=true;
  general_section_buttons_toggle=true;

  login_section_dropdown:boolean=false;
  login_section_buttons_toggle=true;
  password_section_dropdown:boolean=false;

  contact_section_dropdown:boolean=false;
  contact_section_buttons_toggle=true;

  constructor(
    private formBuilder:FormBuilder,
    apiService: AlfrescoApiService) {
      this.peopleApi = new PeopleApi(apiService.getInstance());
  }

  ngOnInit() {
    this.populateForm(this.person_details);

    this.peopleApi
      .getPerson('-me-')
      .then((userInfo) => {
        this.person_details=userInfo?.entry;
        this.populateForm(userInfo?.entry)
      })
      .catch((error) => {
        throwError(error);
      });
  }

  populateForm(userInfo: Person){
    this.profileForm = this.formBuilder.group({
      jobTitle:[userInfo?.jobTitle || '', Validators.required],
      location:[userInfo?.location || '', Validators.required],  //validations
      telephone:[userInfo?.telephone || '', Validators.required],
      mobile: [userInfo?.mobile || '', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10$}")]],
      oldPassword:['', Validators.required],
      newPassword:['', Validators.required],
      verifyPassword:['', Validators.required],
      companyPostCode:[userInfo?.company?.postcode || '', Validators.required],
      companyAddress:[userInfo?.company?.address1 || '', Validators.required],
      companyTelephone:[userInfo?.company?.telephone || '', Validators.required],
      companyEmail:[userInfo?.company?.email || '', Validators.required]
     })
  }

  ngOnDestroy(): void {}

  toggle_general_dropdown(){
    this.general_section_dropdown = !this.general_section_dropdown;
  }

  toggle_general_buttons(){
    this.general_section_buttons_toggle = !this.general_section_buttons_toggle;

    if(!this.general_section_buttons_toggle){
      this.general_section_dropdown = true;
    }
  }

  onSave_general_data(event){
    this.general_section_buttons_toggle = !this.general_section_buttons_toggle;
    this.updatePersonDetails(event);
  }

  onSave_login_data(){
    this.password_section_dropdown = !this.password_section_dropdown;
    this.login_section_buttons_toggle = !this.login_section_buttons_toggle;
  }

  onSave_company_data(event){
    this.contact_section_buttons_toggle = !this.contact_section_buttons_toggle;
    this.updatePersonDetails(event);
  }

  toggle_login_dropdown(){
    this.login_section_dropdown = !this.login_section_dropdown;
  }

  toggle_login_buttons(){
    this.login_section_buttons_toggle = !this.login_section_buttons_toggle;
    this.password_section_dropdown = !this.password_section_dropdown;

    if(!this.login_section_buttons_toggle){
      this.login_section_dropdown = true;
      this.password_section_dropdown = true;
    }
  }

  toggle_contact_dropdown(){
    this.contact_section_dropdown = !this.contact_section_dropdown;
  }

  toggle_contact_buttons(){
    this.contact_section_buttons_toggle = !this.contact_section_buttons_toggle;


    if(!this.contact_section_buttons_toggle){
      this.contact_section_dropdown = true;
    }
  }

  updatePersonDetails(event) {
    this.peopleApi
        .updatePerson(this.person_details.id, {
          jobTitle: event.value.jobTitle,
          location: event.value.location,
          telephone: event.value.telephone,
          mobile: event.value.mobile,
          company: {
            postcode: event.value.companyPostCode,
            address1: event.value.companyAddress,
            telephone: event.value.companyTelephone,
            email: event.value.companyEmail
          }
        })
  }
}
