<%@ Page Title="Customer Login | Healthy Universe" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Login.aspx.cs" Inherits="Login" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
     <main id="content" role="main">
         <div class="container">

              <div class="py-2" style="margin-bottom:0px !important;margin-top: 10px !important;">
                <div class="container">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0"><a href="Default.aspx">Home</a> - Customer Login</div>
                      
                    </div>
                </div>
              </div>
                <hr style="
    margin-top: 0.2rem !important;
" />
             <div class="row">
                    <div class="col-md-8 mb-4 mb-md-0" style="float:none !important;margin:auto !important;vertical-align:middle !important;">
                        <div class="card mb-3 border-0 text-center rounded-0">

                           
  <asp:UpdatePanel ID="update1" runat="server">
       <ContentTemplate>
               <p id="success" runat="server" style="padding:5px !important;background-color:green !important;color:white !important;padding-left:15px !important;"><i class="fa fa-success"></i> &nbsp; <b>Link sent!</b> Please check your inbox.</p>
               <p id="error1" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Account was not found.</p>
               <p id="error2" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Email address OR Contact No. is already registered.</p>
               <p id="error3" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Some Error Occoured.</p>
               <p id="error5" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Email address not found.</p>
        </ContentTemplate>
    </asp:UpdatePanel>

                              <div id="login" data-target-group="idForm">
                                        <!-- Title -->
                                        <header class="text-left mb-7" style="margin-bottom:1rem !important;margin-top:1.5rem !important;">
                                        <h2 class="h4 mb-0" style="font-weight:bold !important;">Welcome Back!</h2>
                                        <p>Login now to enjoy full access to all the services.  <span><span style="font-size:15px !important;color:grey !important;" class="small text-muted">Do not have an account?</span>
                                            <a style="font-size:15px !important;font-weight:bold !important;" class="js-animation-link small text-dark" href="javascript:;"
                                               data-target="#signup"
                                               data-link-group="idForm"
                                               data-animation-in="slideInUp">Register Now
                                            </a></span> <a class="js-animation-link small link-muted" href="javascript:;"
                                               data-target="#forgotPassword"
                                               data-link-group="idForm"
                                               data-animation-in="slideInUp" style="float:right !important;">Forgot Password?</a></p>
                                        </header>
                                        <!-- End Title -->

                                        <!-- Form Group -->
                                        <div class="form-group">
                                            <div class="js-form-message js-focus-state">
                                                <label class="sr-only" for="signinEmail">Email</label>
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text" id="signinEmailLabel">
                                                            <span class="fas fa-user"></span>
                                                        </span>
                                                    </div>
                                                    <asp:TextBox ID="TextBox1l" TextMode="Email" class="form-control" name="email" placeholder="Email" aria-label="Email" aria-describedby="signinEmailLabel" runat="server"></asp:TextBox>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- End Form Group -->

                                        <!-- Form Group -->
                                        <div class="form-group">
                                            <div class="js-form-message js-focus-state">
                                              <label class="sr-only" for="signinPassword">Password</label>
                                              <div class="input-group">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text" id="signinPasswordLabel">
                                                        <span class="fas fa-lock"></span>
                                                    </span>
                                                </div>
                                                     <asp:TextBox class="form-control" TextMode="Password" name="password" placeholder="Password" aria-label="Password" aria-describedby="signinPasswordLabel" ID="TextBox2l" runat="server"></asp:TextBox>
                                              </div>
                                            </div>
                                        </div>
                                        <!-- End Form Group -->


                                        <div class="mb-2" style="width:100% !important;">
                                           <asp:Button ID="Button1" ValidationGroup="one1" OnClick="Button1_Click" class="btn btn-block btn-sm btn-dark transition-3d-hover" runat="server"  Text="Login Now" />
                                            <br/><asp:RequiredFieldValidator ID="RequiredFieldValidator5" ValidationGroup="one1" 
                        style="font-size:13px !important;color:red !important;"  runat="server"
                         Text="Email cannot be left blank"
                         ForeColor="Red" ControlToValidate="TextBox1l"></asp:RequiredFieldValidator>
              <br/><asp:RequiredFieldValidator ID="RequiredFieldValidator1" ValidationGroup="one1" 
                        style="font-size:13px !important;color:red !important;"  runat="server"
                         Text="Password cannot be left blank"
                         ForeColor="Red" ControlToValidate="TextBox2l"></asp:RequiredFieldValidator>
                                     
                                        </div>

                                      
                                    </div>

                                    <!-- Signup -->
                                    <div id="signup" style="display: none; opacity: 0;" data-target-group="idForm">
                                        <!-- Title -->
                                        <header class="text-left mb-7" style="margin-bottom:1rem !important;margin-top:1.5rem !important;">
                                        <h2 class="h4 mb-0" style="font-weight:bolder !important;">Welcome to Healthy Universe</h2>
                                        <p>Fill out the registration form to get started. <span><span style="font-size:15px !important;color:gray !important;" class="small text-muted">Already have an account?</span>
                                            <a style="font-size:15px !important;font-weight:bold !important;" class="js-animation-link small text-dark" href="javascript:;"
                                                data-target="#login"
                                                data-link-group="idForm"
                                                data-animation-in="slideInUp">Login Now
                                            </a></span></p>
                                        </header>
                                        <!-- End Title -->

                                        <!-- Form Group -->
                                        <div class="form-group">
                                            <div class="js-form-message js-focus-state">
                                                <label class="sr-only" for="signupEmail">Email</label>
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text" id="signupEmailLabel">
                                                            <span class="fas fa-user"></span>
                                                        </span>
                                                    </div>
                                                    <asp:TextBox ID="TextBox1s" TextMode="Email" class="form-control" name="email" placeholder="Email" aria-label="Email" aria-describedby="signupEmailLabel" runat="server"></asp:TextBox>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- End Input -->

                                        <!-- Form Group -->
                                        <div class="form-group">
                                            <div class="js-form-message js-focus-state">
                                                <label class="sr-only" for="signupPassword">Password</label>
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text" id="signupPasswordLabel">
                                                            <span class="fas fa-lock"></span>
                                                        </span>
                                                    </div>
                                                    <asp:TextBox class="form-control" TextMode="Password" name="password" placeholder="Password" aria-label="Password" aria-describedby="signupPasswordLabel" ID="TextBox2s" runat="server"></asp:TextBox>
                                                </div>
                                               
                                            </div>
                                        </div>
                                        <!-- End Input -->

                                          <!-- Form Group -->
                                        <div class="form-group">
                                            <div class="js-form-message js-focus-state">
                                                <label class="sr-only" for="signupEmail">Contact No.</label>
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text" id="signupEmailLabel1">
                                                            <span class="fas fa-phone"></span>
                                                        </span>
                                                    </div>
                                                     <script type="text/javascript">
                      function isNumberKey(evt) {
                          var charCode = (evt.which) ? evt.which : evt.keyCode;
                          if (charCode > 31 && (charCode < 48 || charCode > 57))
                              return false;
                          return true;
                      }
</script>
                                                    <asp:TextBox ID="TextBox1" class="form-control" onkeypress="return isNumberKey(event)" MaxLength="10" placeholder="10 Digit No." runat="server"></asp:TextBox>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- End Input -->

                                       

                                        <div class="mb-2" style="width:100% !important;">
                                                <asp:Button ID="Button2" ValidationGroup="two1" OnClick="Button2_Click" class="btn btn-block btn-sm btn-dark transition-3d-hover" runat="server" Text="Get Started" />
                                        <br/><asp:RegularExpressionValidator ID="RegularExpressionValidator2" runat="server" 
                          ErrorMessage="Please Note: Password must contain atleast 1 lowercase letter, 1 uppercase letter, 1 special character & 1 digit. Min. 8 characters long."  
                                     ValidationGroup="two1"  ForeColor="Red"  style="font-size:13px !important;color:red !important;"
        ValidationExpression="^.*(?=.{8,})(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!*@#$%^&+=]).*$"  
        ControlToValidate="TextBox2s"></asp:RegularExpressionValidator>   
                                             <br/><asp:RequiredFieldValidator ID="RequiredFieldValidator2" ValidationGroup="two1" 
                        style="font-size:13px !important;color:red !important;"  runat="server"
                         Text="Email cannot be left blank"
                         ForeColor="Red" ControlToValidate="TextBox1s"></asp:RequiredFieldValidator>
              <br/><asp:RequiredFieldValidator ID="RequiredFieldValidator3" ValidationGroup="two1" 
                        style="font-size:13px !important;color:red !important;"  runat="server"
                         Text="Password cannot be left blank"
                         ForeColor="Red" ControlToValidate="TextBox2s"></asp:RequiredFieldValidator>
           <br/><asp:RequiredFieldValidator ID="RequiredFieldValidator6" ValidationGroup="two1" 
                        style="font-size:13px !important;color:red !important;"  runat="server" Text="Contact No. cannot be left blank"
                         ForeColor="Red" ControlToValidate="TextBox1"></asp:RequiredFieldValidator>
            <br/><asp:RegularExpressionValidator ID="RegularExpressionValidator3" 
                                 runat="server" ControlToValidate="TextBox1" ValidationGroup="two1"
                             ErrorMessage="Contact No. must be exactly 10 digits." 
                                 style="font-size:13px !important;color:red !important;" 
                             ValidationExpression="^\d{10}$"></asp:RegularExpressionValidator>
                                        </div>


                                       
                                    </div>
                                    <!-- End Signup -->

                                    <!-- Forgot Password -->
                                    <div id="forgotPassword" style="display: none; opacity: 0;" data-target-group="idForm">
                                        <!-- Title -->
                                        <header class="text-left mb-7" style="margin-bottom:1rem !important;margin-top:1.5rem !important;">
                                            <h2 class="h4 mb-0" style="font-weight:bolder !important;">Recover Your Account</h2>
                                            <p>Enter your email address and an email with instructions will be sent to you.  <a style="font-size:15px !important;font-weight:bold !important;color:dimgrey !important;" class="js-animation-link small" href="javascript:;"
                                               data-target="#login"
                                               data-link-group="idForm"
                                               data-animation-in="slideInUp">Login Now
                                            </a></p>
                                        </header>
                                        <!-- End Title -->

                                        <!-- Form Group -->
                                        <div class="form-group">
                                            <div class="js-form-message js-focus-state">
                                                <label class="sr-only" for="recoverEmail">Your email</label>
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text" id="recoverEmailLabel">
                                                            <span class="fas fa-user"></span>
                                                        </span>
                                                    </div>
                                                    <asp:TextBox ID="TextBox1f" class="form-control" TextMode="Email" name="email" placeholder="Your email" aria-label="Your email" aria-describedby="recoverEmailLabel" runat="server"></asp:TextBox>
                                               
                                                    
                                                     </div>
                                            </div>
                                        </div>
                                        <!-- End Form Group -->

                                        <div class="mb-2" style="width:100% !important;">
                                            <asp:Button ID="Button3" ValidationGroup="three1" OnClick="Button3_Click" class="btn btn-block btn-sm btn-dark transition-3d-hover" runat="server" Text="Recover Now" />
                                           <br/><asp:RequiredFieldValidator ID="RequiredFieldValidator4" ValidationGroup="three1" 
                        style="font-size:13px !important;color:red !important;"  runat="server"
                         Text="Email cannot be left blank"
                         ForeColor="Red" ControlToValidate="TextBox1f"></asp:RequiredFieldValidator>
                                             </div>

                                          
                                    </div>
                                    <!-- End Forgot Password -->



                        </div>
                    </div>
                    
                </div>

             
               
            </div>
         </main>
</asp:Content>

