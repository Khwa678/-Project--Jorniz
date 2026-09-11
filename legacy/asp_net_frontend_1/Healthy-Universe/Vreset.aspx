<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Vreset.aspx.cs" Inherits="Vreset" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">


       <main id="content" role="main">
         <div class="container">

              <div class="py-2" style="margin-bottom: 0px !important;margin-top: 10px !important;">
                <div class="container" style="padding-left:0px !important;">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0"><a href="Default.aspx" class="font-weight-bold text-gray-90">Home</a> - Reset Your Password</div>
                      
                    </div>
                </div>
              </div>
              <hr style="
    margin-top: 0.2rem !important;
" />
             <div class="row mb-10" style="margin-bottom:2rem !important;margin-top:1.5rem !important;">
                    <div class="col-md-12 col-xl-9">
                        <div class="mr-xl-6">
             
             <p id="success" runat="server" style="padding:5px !important;background-color:green !important;color:white !important;padding-left:15px !important;"><i class="fa fa-success"></i> &nbsp; <b>Password updated!</b> We request you to signin now using new password.</p>
               <p id="error3" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Some Error Occoured. Please Try again later.</p>
                             <div class="border-bottom border-color-1 mb-5" style="margin-bottom:1rem !important;">
                                <h3 class="section-title mb-0 pb-2 font-size-20" style="font-weight:bold !important;">Reset Your Password</h3>
                            </div>
                            <p class="max-width-830-xl text-gray-90">Use the control given below to update your account information.</p>
                            <div class="js-validate">
                                <div class="row">

                                    <div class="col-md-12">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                                 <b>Registered Email Address:</b> <asp:Label ID="Label1" runat="server"></asp:Label>
                                                </label>
                                            </div>
                                        </div>
                                    <div class="col-md-12">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                                Enter New Password
                                                <span class="text-danger">
                                                      <asp:RequiredFieldValidator ID="RequiredFieldValidator1" ValidationGroup="oneoneone" 
                        style="color:red !important;"  runat="server"
                         Text="*" ForeColor="Red" ControlToValidate="TextBox2"></asp:RequiredFieldValidator></span>
                                            </label>
             <asp:TextBox ID="TextBox2" class="form-control" placeholder="Password*" runat="server"></asp:TextBox>
                                              </div>
                                        <!-- End Input -->
                                    </div>
             <div class="mb-3">
              <asp:Button ID="Button2" OnClick="Button2_Click" style="color:white !important;" ValidationGroup="oneoneone"  class="btn btn-dark px-5" runat="server" Text="Update Account" />
                 </div>
            

                            </div>
                        </div>
                 </div>
             
               
            </div>
                 </div>
             </div>
         </main>

</asp:Content>

