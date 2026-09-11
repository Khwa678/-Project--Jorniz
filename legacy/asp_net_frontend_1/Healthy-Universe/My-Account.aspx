<%@ Page Title="Manage Your Account | Healthy Universe" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="My-Account.aspx.cs" Inherits="My_Account" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">


     <asp:Label ID="Label1" runat="server" style="display:none !important;"></asp:Label>
     <asp:Label ID="Label2" runat="server" style="display:none !important;"></asp:Label>
     <asp:Label ID="Label3" runat="server" style="display:none !important;"></asp:Label>
     <asp:Label ID="Label4" runat="server" style="display:none !important;"></asp:Label>

     <main id="content" role="main"  class="cart-page">
         <div class="container">

              <div class="py-2" style="margin-bottom:0px !important;margin-top: 10px !important;">
                <div class="container" style="padding-left:0px !important;">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0"><a href="Default.aspx" class="font-weight-bold text-gray-90">Home</a> - Manage Your Account</div>
                      
                    </div>
                </div>
              </div>
               <hr style="
    margin-top: 0.2rem !important;
" />

  <div id="cartcontrol" runat="server" class="py-2" style="margin-bottom:0px !important;margin-top: 0px !important;">
                <div class="container" style="padding-left:0px !important;">
                 
                     <div class="row" style="padding:10px !important;margin:10px !important;border:solid #f2f2f2 2px !important;">
                  
                    <div class="col-md-9 mb-4 mb-md-0">
                        <p style="margin-bottom:0.4px !important;"><b>Continue with your order.</b></p>
                        <p style="margin-bottom:0.4px !important;">You have products in your Cart. You can process your order rightaway.</p>
                        </div>
                           <div class="col-md-3 mb-4 mb-md-0">
<asp:Button ID="Button4" runat="server" class="btn btn-link" style="border:solid black 2px !important;font-weight:bold !important;border-radius:0px !important;color:black !important;float:right !important;" OnClick="Button4_Click" Text="Continue To Cart" />
                        </div>
                         </div>


                </div>
  </div>



             <div class="row">
                  
                    <div class="col-md-6 mb-4 mb-md-0">
                        <div class="card mb-3 border-0 text-left rounded-0">
                            <div class="card-body">

                <p id="success" runat="server" style="padding:5px !important;background-color:green !important;color:white !important;padding-left:15px !important;"><b>Account Updated!</b> Changes take effect on next login.</p>
               <p id="error3" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;"><b>Sorry!</b> Some Error Occoured. Please Try again later.</p>
                                <p id="error4" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;max-height:35px !important;"><b>Sorry!</b> An account exists with provided email address / Contact No.</p>

                                <h5 class="font-size-18 font-weight-semi-bold mb-3" style="color:#FFDF2B !important;    font-size: 22px !important;
    line-height: 20px !important;margin-bottom:0.5rem !important;">Customer <span style="color:black !important;">Dashboard</span>  <a id="logout" runat="server" style="font-weight:bold !important;float:right !important;font-size:12px !important;color:grey !important;border:solid grey 2px !important;padding:3px 5px !important;">Logout</a></h5>
                                <p style="margin-bottom: 0rem !important;max-width:100% !important;" class="text-gray-90 max-width-334 mx-auto">Use the following control to quickly manage your account information registered with us.</p>
                              
<%--<img style="width:100% !important;height:auto !important;margin:auto !important;" src="Images/accountsafe.png" />--%>

                                <div style="margin-top:20px !important;" class="form-group">
                                            <div class="js-form-message js-focus-state">
                                                <label>Your Name <asp:RequiredFieldValidator 
                                                    ID="RequiredFieldValidator2" ValidationGroup="two123" 
                        style="font-size:13px !important;color:red !important;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox3"></asp:RequiredFieldValidator></label>
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text">
                                                            <span class="fas fa-user"></span>
                                                        </span>
                                                    </div>
                                                    <asp:TextBox class="form-control" OnTextChanged="TextBox3_TextChanged"  AutoPostBack="false" placeholder="Your Name here...*" ID="TextBox3" runat="server"></asp:TextBox>
                                                </div>
                                            </div>
                                        </div>
                             <!-- Form Group -->
                                        <div class="form-group">
                                            <div class="js-form-message js-focus-state">
                                                <label>Communication Email Address <asp:RequiredFieldValidator
                                                    ID="RequiredFieldValidator1" ValidationGroup="two123" 
                        style="font-size:13px !important;color:red !important;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox1"></asp:RequiredFieldValidator></label>
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text" id="signupEmailLabel">
                                                            <span class="fas fa-envelope"></span>
                                                        </span>
                                                    </div>
                                                    <asp:TextBox ID="TextBox1" OnTextChanged="TextBox1_TextChanged" AutoPostBack="false" TextMode="Email" class="form-control" placeholder="Email" aria-label="Email address here...*"  runat="server"></asp:TextBox>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- End Input -->

                                        <!-- Form Group -->
                                        <div class="form-group">
                                            <div class="js-form-message js-focus-state">
                                                <label>Password <asp:RequiredFieldValidator
                                                    ID="RequiredFieldValidator3" ValidationGroup="two123" 
                        style="font-size:13px !important;color:red !important;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox2"></asp:RequiredFieldValidator><asp:RegularExpressionValidator ID="RegularExpressionValidator2" runat="server" 
                          ErrorMessage="Weak Password"  
                                     ValidationGroup="two123"  ForeColor="Red"  style="font-size:13px !important;color:red !important;"
        ValidationExpression="^.*(?=.{8,})(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!*@#$%^&+=]).*$"  
        ControlToValidate="TextBox2"></asp:RegularExpressionValidator></label>
                                                <div class="input-group">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text" id="signupPasswordLabel">
                                                            <span class="fas fa-lock"></span>
                                                        </span>
                                                    </div>
                                                    <asp:TextBox class="form-control" OnTextChanged="TextBox2_TextChanged" AutoPostBack="false" placeholder="Your password here...*" ID="TextBox2" runat="server"></asp:TextBox>
                                                </div>
                                            </div>
                                        </div>


                                       <!-- Form Group -->
                                        <div class="form-group">
                                            <div class="js-form-message js-focus-state">
                                                <label>Contact No. <asp:RequiredFieldValidator
                                                    ID="RequiredFieldValidator8" ValidationGroup="two123" 
                        style="font-size:13px !important;color:red !important;"  runat="server" Text="*"
                         ForeColor="Red" ControlToValidate="TextBox9"></asp:RequiredFieldValidator><asp:RegularExpressionValidator 
                             ID="RegularExpressionValidator3" 
                                 runat="server" ControlToValidate="TextBox9" ValidationGroup="two123"
                             ErrorMessage="Exactly 10 digits." 
                                 style="font-size:13px !important;color:red !important;"
                             ValidationExpression="^\d{10}$"></asp:RegularExpressionValidator></label>
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
                                                    <asp:TextBox ID="TextBox9" OnTextChanged="TextBox9_TextChanged" AutoPostBack="false" class="form-control" placeholder="10 Digit Contact No." aria-label="10 Digit Contact No...*" onkeypress="return isNumberKey(event)" MaxLength="10"  runat="server"></asp:TextBox>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- End Input -->



                                 <div class="mb-2">
                <asp:Button ID="Button2" style="color:white !important;width:120px !important;float:left !important;border-radius:0px !important;" ValidationGroup="two123" OnClick="Button2_Click" class="btn btn-block btn-sm btn-dark transition-3d-hover" runat="server" Text="Update" />

                <asp:Button ID="Button3" style="width:150px !important;float:left !important;margin-top:0px !important;border-radius:0px !important;padding: 0.64rem 1rem !important;color:white !important;" OnClick="Button3_Click" class="btn btn-primary transition-3d-hover" runat="server" Text="Order History" />
                                 
                                        </div>
                            </div>
                        </div>
                    </div>
                  <div class="col-md-6 mb-4">
                        <div class="card mb-3 border-0 text-left rounded-0">
                            <div class="card-body">
                                <h5 class="font-size-18 font-weight-semi-bold mb-3" style="font-size:17px !important;line-height:19px !important;margin-bottom: 0.5rem !important;color:black;font-weight:bolder !important;">Delivery Addresses</h5>
                                <p style="margin-bottom: 1rem !important;max-width:100% !important;" class="text-gray-90 max-width-334 mx-auto">Manage your registered locations for delivery or add a new one using the controls given below.</p>
                              


                                <p id="success2" runat="server" style="padding:5px !important;background-color:green !important;color:white !important;padding-left:15px !important;margin-bottom:0px !important;margin-bottom:5px !important;"><i class="fa fa-check"></i> &nbsp; <b>Success!</b> Your Address was successfully added.</p>
                    <p id="failed" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;margin-bottom:0px !important;margin-bottom:5px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Some Error Occoured. Please Try Again.</p>
                              <hr/>
                                <asp:GridView Width="100%" ID="grdImages" ShowHeaderWhenEmpty="true" runat="server" AutoGenerateColumns="False" 
            EmptyDataText = "No Saved addresses found. You must add one rightaway for a hassle free checkout." CellPadding="4" ShowHeader="false"
            EnableModelValidation="True" 
            onrowdeleting="grdImages_RowDeleting" DataKeyNames="Id">
    <Columns> 
        <asp:TemplateField>
 <ItemTemplate>
 <p style="margin-bottom:0px !important;"><span style="background-color:black !important;color:white !important;padding:2px 7px !important;float:left !important;font-weight:bold !important;"><asp:Label ID="Label1"  runat="server" Text='<%#Eval("Atype").ToString()%>'/></span> &nbsp; <asp:Label ID="lbldesc6" style="color:black !important;"  runat="server" Text='<%#Eval("Faddress").ToString()%>'/> - <asp:Label ID="Label5" style="color:black !important;font-weight:bold !important;" runat="server" Text='<%#Eval("Areacode").ToString()%>'/></p>
     <asp:ImageButton ID="imgbtnDelete" CommandName="Delete" Text="Edit" runat="server" style="float:right !important;margin-top:-19px !important;" ImageUrl="Images/delete.jpg" ToolTip="Delete" Height="20px" Width="20px" />
  
 </ItemTemplate>
 </asp:TemplateField>
     
    </Columns>
    
</asp:GridView>
                                <hr/>
                        <div class="form-group">
							<label><b>Enter Full Address</b> <asp:RequiredFieldValidator ID="RequiredFieldValidator4" 
                                        ValidationGroup="support2" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox4"></asp:RequiredFieldValidator></label>
<asp:TextBox ID="TextBox4" class="form-control" TextMode="MultiLine" placeholder="Specify complete address here.*" runat="server"></asp:TextBox>
						</div>
						<div class="form-group">
							<label>Landmark <asp:RequiredFieldValidator ID="RequiredFieldValidator5" 
                                        ValidationGroup="support2" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox5"></asp:RequiredFieldValidator></label>
						<asp:TextBox ID="TextBox5" class="form-control" placeholder="Helps us find you. ex: Opp. SBI Building" runat="server"></asp:TextBox>
						</div>

                                <div class="form-group">
							<label>Pincode <asp:RequiredFieldValidator ID="RequiredFieldValidator9" 
                                        ValidationGroup="support2" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox10"></asp:RequiredFieldValidator><asp:RegularExpressionValidator 
                             ID="RegularExpressionValidator1" 
                                 runat="server" ControlToValidate="TextBox10" ValidationGroup="support2"
                             ErrorMessage="Exactly 6 digits." 
                                 style="font-size:13px !important;color:red !important;"
                             ValidationExpression="^\d{6}$"></asp:RegularExpressionValidator></label>
						<asp:TextBox ID="TextBox10" class="form-control" placeholder="Enter Area Code" MaxLength="6" onkeypress="return isNumberKey(event)" runat="server"></asp:TextBox>
						</div>


                        <div class="form-group">
							<label>Delivery Area / Region <asp:RequiredFieldValidator ID="RequiredFieldValidator33" 
                                        ValidationGroup="support2" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox6"></asp:RequiredFieldValidator></label>
                                        <asp:TextBox ID="TextBox6" class="form-control" placeholder="Specify your Area. ex: Indira Nagar" runat="server"></asp:TextBox>
					
						</div>      
                        <div class="form-group">
							<label>City <asp:RequiredFieldValidator ID="RequiredFieldValidator6" 
                                        ValidationGroup="support2" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox7"></asp:RequiredFieldValidator></label>
                                        <asp:TextBox ID="TextBox7" class="form-control" placeholder="Enter City here. ex: Lucknow" runat="server"></asp:TextBox>
					
						
						</div>
                                    <div class="form-group">
							<label>State <asp:RequiredFieldValidator ID="RequiredFieldValidator7" 
                                        ValidationGroup="support2" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox8"></asp:RequiredFieldValidator></label>
                                        <asp:TextBox ID="TextBox8" class="form-control" placeholder="Enter State here. ex: Uttar Pradesh" runat="server"></asp:TextBox>
					
						
						</div>
                        <div class="form-group">
							<label>Choose Address Type</label>
						<asp:DropDownList class="form-control" ID="DropDownList3" runat="server">
                             <asp:ListItem>Home</asp:ListItem>
                            <asp:ListItem>Office</asp:ListItem>
                            <asp:ListItem>Other</asp:ListItem>
						</asp:DropDownList>
						</div>


                   <div class="form-group">
                        <asp:Button ID="Button1" OnClick="Button1_Click" class="btn btn-outline-dark btn-sm btn-gray transition-3d-hover" style="border-radius:0px !important;float:right !important;" ValidationGroup="support2" runat="server" Text="Add New Address" />
					</div>
                            </div>
                        </div>
                    </div>
                </div>

             
               
            </div>
         </main>
</asp:Content>

