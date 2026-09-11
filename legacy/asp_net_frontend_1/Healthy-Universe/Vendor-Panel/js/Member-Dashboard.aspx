<%@ Page Title="" Language="C#" MasterPageFile="~/System-Administrator/MasterPage.master" AutoEventWireup="true" CodeFile="Member-Dashboard.aspx.cs" Inherits="Member_Dashboard" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">

   <script type = "text/javascript">
        function DisableButtons() {
            var inputs = document.getElementsByTagName("INPUT");
            for (var i in inputs) {
                if (inputs[i].type == "button" || inputs[i].type == "submit") {
                    inputs[i].disabled = true;
                }
            }
        }
        window.onbeforeunload = DisableButtons;
    </script>
      
    <style type="text/css">
      
        table
        {
            border: 1px solid #ccc;
            width:100% !important;
            margin-bottom: -1px;
            font-family:Arial !important;
        }
        table th
        {
            background-color: #F7F7F7;
            color: #333;
            font-weight: bold;
        }
        table th, table td
        {
            padding: 5px;
            border-color: #ccc;
        }
    </style>
     <main style="margin-top:110px !important;">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">

                    <h1 style="margin-bottom:15px !important;padding-bottom:0px !important;font-size:21px !important;font-weight:bold !important;">Member Management</h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block"  style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-0" style="margin-bottom:0rem !important;">
                            <li class="breadcrumb-item">
                                <a href="Dashboard.aspx">Dashboard</a>
                            </li>
                           
                            <li class="breadcrumb-item active" aria-current="page">Manage Members</li>
                        </ol>
                    </nav>
                    <div class="separator mb-5"></div>

                </div>
            </div>

            <div class="row">
          
                <div class="col-md-12 col-lg-6 col-xl-6 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                            
                             <div id="failed" runat="server" style="margin-bottom:20px !important;" class="alert alert-danger alert-dismissible fade show mb-0" role="alert">
                                <strong>Operation failed!</strong> Please try again later or contact support.
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                 </div>
                               <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;letter-spacing:0.4px !important;margin-bottom:6px !important;">List a New Member</h6>
                            <p style="margin-bottom:1.4rem !important;">Add a new member record to the network.</p>
                             
                            <div class="needs-validation mb-5">
                                
                                <div class="form-row">
      
                       <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;font-weight:bold !important;">Full Name*  <asp:RequiredFieldValidator ID="RequiredFieldValidator1" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox1"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                     <asp:TextBox ID="TextBox1" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                       <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;font-weight:bold !important;">Email Address* <asp:RequiredFieldValidator ID="RequiredFieldValidator3sx" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox2"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                       <asp:TextBox ID="TextBox2" class="form-control" TextMode="Email" style="color:darkslateblue !important;background-color:#fafafa !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                           </div>
                                          <div class="col-md-6 mb-3">
                                <label for="validationTooltipUsername2" style="width:100% !important;font-weight:bold !important;">Contact No.* <asp:RequiredFieldValidator ID="RequiredFieldValidator4" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox3"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                                            <script type="text/javascript">
                                                function isNumberKey(evt) {
                                                    var charCode = (evt.which) ? evt.which : evt.keyCode;
                                                    if (charCode > 31 && (charCode < 48 || charCode > 57))
                                                        return false;
                                                    return true;
                                                }
                                            </script>
                     <asp:TextBox ID="TextBox3" class="form-control" onkeypress="return isNumberKey(event)" style="color:darkslateblue !important;background-color:#fafafa !important;" MaxLength="10" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                               </div>
                                     <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;font-weight:bold !important;">Father/Husband* <asp:RequiredFieldValidator ID="RequiredFieldValidator2" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox4"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox4" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                       <div class="col-md-12 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;font-weight:bold !important;">Date of Birth </label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox5" class="form-control"  style="color:darkslateblue !important;background-color:#fafafa !important;" placeholder="DD/MM/YYYY" runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                     <div class="col-md-6 mb-3">
                                   <asp:DropDownList ID="DropDownList1" class="form-control" style="width: 100% !important;
    height: 40px !important;
    border: 1 !important;
    padding: 0 18px !important;
    font-weight: 300 !important;background-color:#fAfAfA !important;" runat="server" required="true">
                              <asp:ListItem>-- Select Gender -- </asp:ListItem>
                              <asp:ListItem>Male</asp:ListItem>
                              <asp:ListItem>Female</asp:ListItem>
                              <asp:ListItem>Other</asp:ListItem>
                                  </asp:DropDownList>    
                                      </div>
                                     
                          <div class="col-md-6 mb-3">                
                          <asp:DropDownList ID="DropDownList2" style="width: 100% !important;
    height: 40px !important;
   border: 1 !important;
    padding: 0 18px !important;
    font-weight: 300 !important;background-color:#fafafa !important;" runat="server" required="true">
                              <asp:ListItem>-- Select a State -- </asp:ListItem>
                              <asp:ListItem>Andhra Pradesh</asp:ListItem>
                              <asp:ListItem>Arunachal Pradesh</asp:ListItem>
                              <asp:ListItem>Assam</asp:ListItem>
                              <asp:ListItem>Bihar</asp:ListItem>
                              <asp:ListItem>Chhattisgarh</asp:ListItem>
                              <asp:ListItem>Goa</asp:ListItem>
                              <asp:ListItem>Gujarat</asp:ListItem>
                              <asp:ListItem>Haryana</asp:ListItem>
                              <asp:ListItem>Himachal Pradesh</asp:ListItem>
                              <asp:ListItem>Jammu and Kashmirs</asp:ListItem>
                              <asp:ListItem>Jharkhand</asp:ListItem>
                              <asp:ListItem>Karnataka</asp:ListItem>
                              <asp:ListItem>Kerala</asp:ListItem>
                              <asp:ListItem>Madhya Pradesh</asp:ListItem>
                              <asp:ListItem>Maharashtra</asp:ListItem>
                              <asp:ListItem>Manipur</asp:ListItem>
                              <asp:ListItem>Meghalaya</asp:ListItem>
                              <asp:ListItem>Mizoram</asp:ListItem>
                              <asp:ListItem>Nagaland</asp:ListItem>
                              <asp:ListItem>Odisha</asp:ListItem>
                              <asp:ListItem>Punjab</asp:ListItem>
                              <asp:ListItem>Rajasthan</asp:ListItem>
                              <asp:ListItem>Sikkim</asp:ListItem>
                              <asp:ListItem>Tamil Nadu</asp:ListItem>
                              <asp:ListItem>Telangana</asp:ListItem>
                              <asp:ListItem>Tripura</asp:ListItem>
                              <asp:ListItem>Uttar Pradesh</asp:ListItem>
                              <asp:ListItem>Uttarakhand</asp:ListItem>
                              <asp:ListItem>West Bengal</asp:ListItem>
                            
                          </asp:DropDownList>
                            </div>
                             <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;font-weight:bold !important;">City </label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox6" class="form-control"  style="color:darkslateblue !important;background-color:#fafafa !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                      <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;font-weight:bold !important;">Pincode </label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox10" class="form-control"  style="color:darkslateblue !important;background-color:#fafafa !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                    
                                      <div class="col-md-12 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;font-weight:bold !important;">Street/House No. </label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox7" class="form-control"  style="color:darkslateblue !important;background-color:#fafafa !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                       <div class="col-md-12 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;font-weight:bold !important;">Address </label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox8" class="form-control"  style="color:darkslateblue !important;background-color:#fafafa !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                        <div class="col-md-12 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;font-weight:bold !important;">Landmark </label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox9" class="form-control"  style="color:darkslateblue !important;background-color:#fafafa !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                    
                                    
                                    <asp:Button ID="Button1" OnClick="Button1_Click" runat="server" ValidationGroup="one" class="btn btn-secondary"
                                Text="Create Member Record" />                                                        

                              </div>
                                    </div>
                             </div>
                           </div>
                        </div>
                              <div class="col-md-12 col-lg-6 col-xl-6 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;letter-spacing:0.4px !important;margin-bottom:6px !important;">Manage Member List</h6>
                            <p style="margin-bottom:1.4rem !important;">Manage / Review all members listed over the network.</p>
                                <%--  <div id="editfacilityna" runat="server" style="margin-bottom:20px !important;" class="alert alert-danger alert-dismissible fade show mb-0" role="alert">
                                <strong>Editing / Removing service is diabled!</strong> Service will be available post Member Dashboard Deployment.
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                 </div>
                <div id="validationna" runat="server" style="margin-bottom:20px !important;" class="alert alert-danger alert-dismissible fade show mb-0" role="alert">
                                <strong>Automated Email Facility Not Available</strong>. Service will be available post Member Dashboard Deployment.
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                 </div>--%>
     <asp:GridView Width="100%" ID="grdImages" ShowHeaderWhenEmpty="true" runat="server" AutoGenerateColumns="False"
            CellPadding="4" ShowHeader="true"
            EnableModelValidation="True" 
         DataKeyNames="Id">
    <Columns> 
         <asp:TemplateField HeaderText="Members Information">
 <ItemTemplate>
 <b>Member UID</b>: AOPM0<asp:Label ID="lbldesc6jhgh" style="color:black !important"  runat="server" Text='<%#Eval("Id").ToString()%>'/> | <b>Full Name</b>: <asp:Label ID="lbldesc6" style="color:black !important"  runat="server" Text='<%#Eval("Name").ToString()%>'/><br/>
<b>Email</b>: <asp:Label ID="Label1" style="color:black !important"  runat="server" Text='<%#Eval("Email").ToString()%>'/> | <b>Contact</b>: <asp:Label ID="lbldesc6bvcb" style="color:black !important"  runat="server" Text='<%#Eval("Contact").ToString()%>'/> 
  <br/><b>Member Since</b>: <asp:Label ID="Label2" style="color:black !important"  runat="server" Text='<%#Eval("Regdate").ToString()%>'/>
 <br/><br/>
     <asp:Button ID="Button2" runat="server" style="cursor:not-allowed !important;" Text="Edit Records" /> <asp:Button ID="Button3" runat="server" style="cursor:not-allowed !important;" Text="Suspend" /> <asp:Button ID="Button4" runat="server" style="cursor:not-allowed !important;" Text="Permanently Remove" /> <asp:Button ID="Button5" runat="server" style="cursor:not-allowed !important;" Text="MLM Portfolio" />

 </ItemTemplate>
 </asp:TemplateField>
   
   
        
    </Columns>
    
</asp:GridView>
     <div id="emptylist" style="width:100% !important" runat="server">
                                                    <div style="width:100% !important;margin:auto !important;padding:20px !important;border:none;margin-top:0px !important;background-color:#fafafa !important;">
                                                        <table style="width:100% !important;border:none !important;">
                                                            <tr>
                                                                <td style="padding:0px !important;width:40% !important;text-align:center !important;">
<img style="width:70% !important;height:auto !important;margin:auto !important" src="Images/noitem.png" />
                                                                </td>
                                                                <td style="padding:0px !important;width:60% !important">
<h2 style="padding-top:30px;font-size:22px !important;color:#00365a !important;font-weight:bold !important;">No Members Found!</h2>
                          <p>No member records were found in the database.</p>
                          
                                                                </td>
                                                            </tr>
                                                            </table>
                                                    </div>
                                                </div>
                              </div>
                        </div>
                     </div>
                   
              </div>              
</main>


</asp:Content>

