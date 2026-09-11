<%@ Page Title="Registration Form | Health & Fitness Products | Diagnostic Services" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Registration.aspx.cs" Inherits="Registration" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">


    <main id="content" role="main">
         <div class="container">

              <div class="py-2" style="margin-bottom:0px !important;margin-top: 10px !important;">
                <div class="container" style="padding-left:0px !important;">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0"><a href="Default.aspx" class="font-weight-bold text-gray-90">Home</a> - Seller Registration Form
                        </div>
                    </div>
                </div>
              </div>
               <hr style="
    margin-top: 0.2rem !important;"/>
 
             <div class="row mb-10" style="margin-bottom:2rem !important;margin-top:1.5rem !important;">               
                    <div class="col-md-10 col-xl-10" style="margin:auto !important">
                        <div class="mr-xl-6">       
                                    <div id="success" runat="server" style="margin-bottom:20px !important;background-color:green !important;color:#fff !important" class="alert alert-danger alert-dismissible fade show mb-0" role="alert">
                                <strong>Submit Registration Form!</strong> Thank you for Submit Registration Form Healthy Universe team "will be in touch shortly".
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>

                             <div id="failed" runat="server" style="margin-bottom:20px !important;" class="alert alert-danger alert-dismissible fade show mb-0" role="alert">
                                <strong>Operation failed!</strong> Please try again later or contact support.
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>

                             <div id="failed2" runat="server" style="margin-bottom:20px !important;" class="alert alert-danger alert-dismissible fade show mb-0" role="alert">
                                <strong>Fields Missing!</strong> Kindly recheck & Please try again later.
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="border-bottom border-color-1 mb-5" style="margin-bottom:1rem !important;">
                                <h3 class="section-title mb-0 pb-2 font-size-20" style="font-weight:bold !important;">Seller Registration Form</h3>
                            </div>
                            <p class="max-width-830-xl text-gray-90"></p>
                            <div class="js-validate">
                                <div class="row">

                                      <div class="col-md-6">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                              Full Name
                                            </label>
                                        <asp:TextBox ID="TextBox1" class="form-control" placeholder="Write here..." runat="server"></asp:TextBox>
                                        </div>
                                        <!-- End Input -->
                                    </div>

                                    <div class="col-md-6">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                               Contact No<span class="text-danger">
                                                    <asp:RequiredFieldValidator ID="RequiredFieldValidator3" ValidationGroup="one1111" 
                        style="color:red !important;"  runat="server" Text="*"
                         ForeColor="Red" ControlToValidate="TextBox2"></asp:RequiredFieldValidator></span>
                                            </label>
                                           <asp:TextBox ID="TextBox2" class="form-control" TextMode="Phone" MaxLength="10" placeholder="Write here..." runat="server"></asp:TextBox>
                                        </div>
                                        <!-- End Input -->
                                    </div>

                                    <div class="col-md-6">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                                Email Address<span class="text-danger">
                                                    <asp:RequiredFieldValidator ID="RequiredFieldValidator4" ValidationGroup="one1111" 
                        style="color:red !important;"  runat="server" Text="*"
                         ForeColor="Red" ControlToValidate="TextBox3"></asp:RequiredFieldValidator></span>
                                            </label>
                                        <asp:TextBox ID="TextBox3" class="form-control" TextMode="Email" placeholder="Write here..." runat="server"></asp:TextBox>
                                        </div>
                                        <!-- End Input -->
                                    </div>

                                    <div class="col-md-6">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                                Name of Business
                                            </label>
                                           <asp:TextBox ID="TextBox4" class="form-control" TextMode="SingleLine" placeholder="Write here..." runat="server"></asp:TextBox>
                                        </div>
                                        <!-- End Input -->
                                    </div>

                                    <div class="col-md-6">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                              Quick Description 
                                            </label>
                                        <asp:TextBox ID="TextBox5" class="form-control" placeholder="Write here..." runat="server"></asp:TextBox>
                                        </div>
                                        <!-- End Input -->
                                    </div>
                                              
                   <div class="col-md-6 mb-3"" style="padding-right: 5px !important;padding-left: 5px !important;">
                        <label class="form-label">
                                          Select a Department
                                            </label>
                                        <div class="input-group">
                       <asp:DropDownList ID="DropDownList2" AutoPostBack="true" class="form-control" runat="server"></asp:DropDownList>
                                        </div>
                                    </div>
                                

                             
                                    <div class="col-md-6">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                                Full Address<span class="text-danger">
                                                    <asp:RequiredFieldValidator ID="RequiredFieldValidator1" ValidationGroup="one1111" 
                        style="color:red !important;"  runat="server" Text="*"
                         ForeColor="Red" ControlToValidate="TextBox6"></asp:RequiredFieldValidator></span>
                                            </label>
                                        <asp:TextBox ID="TextBox6" class="form-control" placeholder="Write here..." runat="server"></asp:TextBox>
                                        </div>
                                        <!-- End Input -->
                                    </div>

                                        <div class="col-md-6">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                                City<span class="text-danger">
                                                    <asp:RequiredFieldValidator ID="RequiredFieldValidator2" ValidationGroup="one1111" 
                        style="color:red !important;"  runat="server" Text="*"
                         ForeColor="Red" ControlToValidate="TextBox7"></asp:RequiredFieldValidator></span>
                                            </label>
                                        <asp:TextBox ID="TextBox7" class="form-control" placeholder="Write here..." runat="server"></asp:TextBox>
                                        </div>
                                        <!-- End Input -->
                                    </div>

                                         <div class="col-md-6 mb-3">
                                  <label class="form-label">State</label>
                                   <div class="input-group">
                   <asp:DropDownList class="form-control" ID="DropDownList1" runat="server">
                         <asp:ListItem value="AN">Andaman and Nicobar Islands</asp:ListItem>
    <asp:ListItem value="AP">Andhra Pradesh</asp:ListItem>
    <asp:ListItem value="AR">Arunachal Pradesh</asp:ListItem>
    <asp:ListItem value="AS">Assam</asp:ListItem>
    <asp:ListItem value="BR">Bihar</asp:ListItem>
    <asp:ListItem value="CH">Chandigarh</asp:ListItem>
    <asp:ListItem value="CT">Chhattisgarh</asp:ListItem>
    <asp:ListItem value="DN">Dadra and Nagar Haveli</asp:ListItem>
    <asp:ListItem value="DD">Daman and Diu</asp:ListItem>
    <asp:ListItem value="DL">Delhi</asp:ListItem>
    <asp:ListItem value="GA">Goa</asp:ListItem>
    <asp:ListItem value="GJ">Gujarat</asp:ListItem>
    <asp:ListItem value="HR">Haryana</asp:ListItem>
    <asp:ListItem value="HP">Himachal Pradesh</asp:ListItem>
    <asp:ListItem value="JK">Jammu and Kashmir</asp:ListItem>
    <asp:ListItem value="JH">Jharkhand</asp:ListItem>
    <asp:ListItem value="KA">Karnataka</asp:ListItem>
    <asp:ListItem value="KL">Kerala</asp:ListItem>
    <asp:ListItem value="LA">Ladakh</asp:ListItem>
    <asp:ListItem value="LD">Lakshadweep</asp:ListItem>
    <asp:ListItem value="MP">Madhya Pradesh</asp:ListItem>
    <asp:ListItem value="MH">Maharashtra</asp:ListItem>
    <asp:ListItem value="MN">Manipur</asp:ListItem>
    <asp:ListItem value="ML">Meghalaya</asp:ListItem>
    <asp:ListItem value="MZ">Mizoram</asp:ListItem>
    <asp:ListItem value="NL">Nagaland</asp:ListItem>
    <asp:ListItem value="OR">Odisha</asp:ListItem>
    <asp:ListItem value="PY">Puducherry</asp:ListItem>
    <asp:ListItem value="PB">Punjab</asp:ListItem>
    <asp:ListItem value="RJ">Rajasthan</asp:ListItem>
    <asp:ListItem value="SK">Sikkim</asp:ListItem>
    <asp:ListItem value="TN">Tamil Nadu</asp:ListItem>
    <asp:ListItem value="TG">Telangana</asp:ListItem>
    <asp:ListItem value="TR">Tripura</asp:ListItem>
    <asp:ListItem value="UP">Uttar Pradesh</asp:ListItem>
    <asp:ListItem value="UT">Uttarakhand</asp:ListItem>
    <asp:ListItem value="WB">West Bengal</asp:ListItem>
                   </asp:DropDownList>
                                        </div>
                                        </div>

                                         <div class="col-md-6">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                             GSTIN [OPTIONAL]
                                            </label>
                                        <asp:TextBox ID="TextBox8" class="form-control" placeholder="Write here..." runat="server"></asp:TextBox>
                                        </div>
                                        <!-- End Input -->
                                    </div>
                                    
                                
                                       <div class="col-md-6">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                            Business PAN [OPTIONAL]
                                            </label>
                                        <asp:TextBox ID="TextBox10" class="form-control" placeholder="Write here..." runat="server"></asp:TextBox>
                                        </div>
                                        <!-- End Input -->
                                    </div>

                                               <div class="col-md-6">
                                        <!-- Input -->
                                        <div class="js-form-message mb-4">
                                            <label class="form-label">
                                               Password<span class="text-danger">
                                                    <asp:RequiredFieldValidator ID="RequiredFieldValidator5" ValidationGroup="one1111" 
                        style="color:red !important;"  runat="server" Text="*"
                         ForeColor="Red" ControlToValidate="TextBox9"></asp:RequiredFieldValidator></span>
                                            </label>
                                        <asp:TextBox ID="TextBox9" class="form-control" TextMode="Password" placeholder="Write here..." runat="server"></asp:TextBox>
                                        </div>
                                        <!-- End Input -->
                                    </div>


                                         <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Company Logo / Display Picture [Optional]
    <asp:RegularExpressionValidator ID="RegularExpressionValidator1" ValidationGroup="one" 
        ValidationExpression="([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.png|.JPG|.JPEG|.PNG)$"
    ControlToValidate="FileUpload1" runat="server"  style="color:Red;font-weight:bold;font-size:12px;"
        ErrorMessage="Supported Formats [.jpg, .jpeg, .png, .JPG, .JPEG, .PNG]"
    Display="Dynamic" /></label>
                                        <div class="input-group">
                     <asp:FileUpload ID="FileUpload1" class="form-control" runat="server" />
                                        </div>
                                    </div>
                                 
                                </div>
                                <div class="mb-3">
                                    <asp:Button ID="Button1" runat="server" style="color:white !important;background-color: darkslateblue !important;;" ValidationGroup="one1111" OnClick="Button1_Click" class="btn px-5" Text="SUBMIT FORM" />
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                  
                </div>
             
               
            </div>
         </main>



</asp:Content>

