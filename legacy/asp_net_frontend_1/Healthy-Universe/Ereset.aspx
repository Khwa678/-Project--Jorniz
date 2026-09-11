<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Ereset.aspx.cs" Inherits="Ereset" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <div class="top-header" style="width:100% !important;background-color: #fafafa;">

        <p style="padding: 20px !important;font-weight:600"><a href="Default.aspx" style="font-weight:600">Home</a> / Seller Account Reset Password</p>
        </div>
     <asp:UpdatePanel ID="update1" runat="server">
       <ContentTemplate>
               <p id="success" runat="server" style="padding:5px !important;background-color:green !important;color:white !important;padding-left:15px !important;"><i class="fa fa-success"></i> &nbsp; <b>Link sent!</b> Please check your inbox.</p>
               <p id="error1" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Account was not found.</p>
               <p id="error2" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Email address OR Contact No. is already registered.</p>
               <p id="error3" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Some Error Occoured.</p>
               <p id="error5" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Email address not found.</p>
        </ContentTemplate>
    </asp:UpdatePanel>
           <!-- Forgot Password -->

                                    <div id="forgotPassword" data-target-group="idForm" style="wid">
                                        <div class="container">
                                            <div class="col-8 col-wd-6 col-md-6" style="margin:auto !important">
                                        <!-- Title -->
                                        <header class="text-center mb-7">
                                            <h2 class="h4 mb-0"  style="font-weight:bold !important;">Recover Account</h2>
                                            <p>Enter your registered email address.<br/><a  href="Vendor-Login.aspx"style="font-weight:bold !important;color:darkblue !important;">Login Now
                                            </a></p>
                                        </header>
                                        <!-- End Title -->

                                        <!-- Form Group -->
                                        <div class="form-group">
                                            <div class="js-form-message js-focus-state">
                                                <label class="sr-only" for="recoverEmail">Reg. Email Address</label>
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text"  style="border-radius:3px !important;" id="recoverEmailLabel">
                                                            <span class="fas fa-user"></span>
                                                        </span>
                                                    </div>
                                                    <asp:TextBox ID="TextBox1f" class="form-control" TextMode="Email" name="email" placeholder="Your email" aria-label="Your email" aria-describedby="recoverEmailLabel" style="background-color:#fafafa !important;border-radius:3px !important;" runat="server"></asp:TextBox>
                                               
                                                    
                                                     </div>
                                            </div>
                                        </div>
                                        <!-- End Form Group -->

                                        <div class="mb-2">
                                            <asp:Button ID="Button3" ValidationGroup="three2222" OnClick="Button3_Click" class="btn btn-block btn-sm btn-outline-black transition-3d-hover" runat="server"  style="border-radius:3px !important;" Text="Recover Password" />
                                             <br/><asp:RequiredFieldValidator ID="RequiredFieldValidator4" ValidationGroup="three2222" 
                        style="font-size:13px !important;color:red !important;"  runat="server"
                         Text="Email cannot be left blank"
                         ForeColor="Red" ControlToValidate="TextBox1f"></asp:RequiredFieldValidator>
                                             </div>
                                          </div>
                                    </div>
                                        </div>
                                    
                                    <!-- End Forgot Password -->
</asp:Content>

