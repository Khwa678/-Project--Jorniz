<%@ Page Title="Contact Us | Healthy Universe" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Contact.aspx.cs" Inherits="Contact" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
     <main id="content" role="main">
         <div class="container">

              <div class="py-2" style="margin-bottom:0px !important;margin-top: 10px !important;">
                <div class="container" style="padding-left:0px !important;">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0"><a href="Default.aspx" >Home</a> - Support Center</div>
                    </div>
                </div>
              </div>
               <hr style="
    margin-top: 0.2rem !important;
" />
             
             <div class="row mb-10" style="margin-bottom:2rem !important;margin-top:1.5rem !important;">
                    <div class="col-md-8 col-xl-6">
                        <div class="mr-xl-6">

            <p id="success" runat="server" style="padding:5px !important;background-color:green !important;color:white !important;padding-left:15px !important;"><i class="fa fa-success"></i> &nbsp; <b>Message Sent!</b> Thank you for contacting Healthy Universe support.</p>
           <p id="error3" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Some Error Occoured. Please Try again later.</p>


                            <div class="border-bottom border-color-1 mb-5" style="margin-bottom:1rem !important;">
                                <h3 class="section-title mb-0 pb-2 font-size-20" style="font-weight:bold !important;">Leave us a Message</h3>
                            </div>
                            <p >Have any questions? Reach out to us from our contact form and we will get back to you shortly. Our team of support professionals are standing by to help you out as a priority.</p>
                            <div class="js-validate">
                                <div class="row">
                                    <div class="col-md-6">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                                Your name
                                                <span class="text-danger">
                                                    <asp:RequiredFieldValidator ID="RequiredFieldValidator2" ValidationGroup="onetwo" 
                        style="color:red !important;"  runat="server" Text="*"
                         ForeColor="Red" ControlToValidate="TextBox1"></asp:RequiredFieldValidator></span>
                                            </label>
                                        <asp:TextBox ID="TextBox1" class="form-control" placeholder="Your name here..." runat="server"></asp:TextBox>
                                        </div>
                                        <!-- End Input -->
                                    </div>

                                    <div class="col-md-6">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                                Email Address
                                                <span class="text-danger"><asp:RequiredFieldValidator ID="RequiredFieldValidator1" ValidationGroup="onetwo" 
                        style="color:red !important;"  runat="server" Text="*"
                         ForeColor="Red" ControlToValidate="TextBox2"></asp:RequiredFieldValidator></span>
                                            </label>
                                           <asp:TextBox ID="TextBox2" class="form-control" TextMode="Email" placeholder="Your email here..." runat="server"></asp:TextBox>
                                        </div>
                                        <!-- End Input -->
                                    </div>

                                    <div class="col-md-12">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                                Subject Of Concern
                                            </label>
                                         <asp:TextBox ID="TextBox3" class="form-control" placeholder="Subject of concern here..." runat="server"></asp:TextBox>
                                        </div>
                                        <!-- End Input -->
                                    </div>
                                    <div class="col-md-12">
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                                Your Message
                                                <span class="text-danger"><asp:RequiredFieldValidator ID="RequiredFieldValidator3" ValidationGroup="onetwo" 
                        style="color:red !important;"  runat="server" Text="*"
                         ForeColor="Red" ControlToValidate="TextBox4"></asp:RequiredFieldValidator></span>
                                            </label>

                                            <div class="input-group">
                                               <asp:TextBox ID="TextBox4" class="form-control" TextMode="MultiLine" style="height:120px !important;" placeholder="Write your message / feedbacks / queries here..." runat="server"></asp:TextBox>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                      <asp:Button ID="Button1" style="color:white !important;" ValidationGroup="onetwo"  class="btn btn-dark px-5" runat="server" OnClick="Button1_Click" Text="Send Message"></asp:Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 col-xl-6">
                        <div class="border-bottom border-color-1 mb-5" style="margin-bottom:1rem !important;">
                            <h3 class="section-title mb-0 pb-2 font-size-20" style="font-weight:bold !important;">Visit Our Store</h3>
                        </div>
                        <p> <b>Address - </b> RISING SKYLINE HEALTHTECH PRIVATE LIMITED 521M/8, MAIJI KI BAGIYA, BARA CHAND GANJ, LUCKNOW, Uttar Pradesh, India, 226006 </p>
                        <div class="mr-xl-6">
                            <iframe src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d14235.843791902864!2d80.9760448!3d26.8729818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e0!3m2!1sen!2sin!4v1693686792587!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                        </div>
                    </div>
                </div>
             
               
            </div>
         </main>
</asp:Content>

