<%@ Page Title="" Language="C#" MasterPageFile="~/System-Administrator/MasterPage.master" AutoEventWireup="true" CodeFile="Doctors.aspx.cs" Inherits="System_Administrator_Doctors" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
     <asp:ScriptManager ID="ScriptManager1" runat="server"></asp:ScriptManager>
   
    <script src='https://cdn.tiny.cloud/1/ov5n6bpyebameb5jarhpw01l3jckz2vckvchfd65odkus50m/tinymce/5/tinymce.min.js' referrerpolicy="origin"></script>
  
    
  <script>
      tinymce.init({ selector: 'textarea', width: 550 });
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

     <script type="text/javascript">
         function validateFloatKeyPress(el) {
             var v = parseFloat(el.value);
             el.value = (isNaN(v)) ? '' : v.toFixed(2);
         }
     </script>
     <script type="text/javascript">
         function isNumberKey(evt) {
             var charCode = (evt.which) ? evt.which : evt.keyCode;
             if (charCode > 31 && (charCode < 48 || charCode > 57))
                 return false;
             return true;
         }
                                         </script>
<main style="margin-top: 85px !important;">
        <div class="container-fluid">
            <div class="row  ">
                <div class="col-12">
                    <h1 style="margin-bottom:0px !important;padding-bottom:0px !important;font-size:17px !important;"><b>Doctors</b> Management</h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block" style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-0" style="margin-bottom:0rem !important;padding:0px !important;">
                            <li class="breadcrumb-item active">
                                <b>Dashboard</b>
                            </li>
                            <li class="breadcrumb-item">
                                <a href="#">Manage Doctors</a>
                            </li>
                        </ol>
                    </nav>
                    
                </div>
                  
                
            </div>
              <hr style="margin-top: 0.5rem !important;margin-bottom: 1rem !important;" />

            <div class="row">

                <div class="col-md-12 col-lg-6 col-xl-12 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                            
                             <div id="failed" runat="server" style="margin-bottom:20px !important;" class="alert alert-danger alert-dismissible fade show mb-0" role="alert">
                                <strong>Operation failed!</strong> Please try again later or contact support.
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>


                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:6px !important;">A. List a New Profile</h6>
                            <p style="margin-bottom:1.4rem !important;">Add a new doctor / medical practitioner to the network.</p>
                             
                            <div class="needs-validation mb-5">
                                
                                <div class="form-row">
                   <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Full Name  <asp:RequiredFieldValidator ID="RequiredFieldValidator1" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox2"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                     <asp:TextBox ID="TextBox2" class="form-control" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                           <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Email Address</label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox4" class="form-control" TextMode="Email" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                           <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Contact No  <asp:RequiredFieldValidator ID="RequiredFieldValidator3sx" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox1"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                       <asp:TextBox ID="TextBox1" class="form-control" onkeypress="return isNumberKey(event)" style="color:darkslateblue !important;" MaxLength="10" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                               </div>
                                     <div class="col-md-6 mb-3">
                                <label for="validationTooltipUsername2" style="width:100% !important;">Consultation Fee <asp:RequiredFieldValidator ID="RequiredFieldValidator4" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox6"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                     <asp:TextBox ID="TextBox6" class="form-control" onchange="validateFloatKeyPress(this);" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                           </div>
                                     <div class="col-md-6 mb-3">
                                 <label for="validationTooltipUsername2" style="width:100% !important;">Booking Fee <asp:RequiredFieldValidator ID="RequiredFieldValidator6" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox8"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                     <asp:TextBox ID="TextBox8" class="form-control" onchange="validateFloatKeyPress(this);" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                     <div class="col-md-6 mb-3">
                                  <label for="validationTooltipUsername2" style="width:100% !important;">Professional Expertise</label>
                                   <div class="input-group">
                   <asp:DropDownList class="form-control" ID="DropDownList3" runat="server">
                         <asp:ListItem Value="1">General Surgeon</asp:ListItem>
                        <asp:ListItem  Value="2">Sexologist</asp:ListItem>
                        <asp:ListItem  Value="3">Neurologist</asp:ListItem>
                        <asp:ListItem  Value="4">General Physician</asp:ListItem>
                        <asp:ListItem  Value="5"> Homeopath</asp:ListItem>
                        <asp:ListItem  Value="6">Ophthalmologist</asp:ListItem> 
                        <asp:ListItem  Value="7">Physiotherapist</asp:ListItem>
                        <asp:ListItem  Value="8">Psychiatry</asp:ListItem> 
                        <asp:ListItem  Value="9">Dermatologist</asp:ListItem> 
                        <asp:ListItem  Value="10">Psychologist</asp:ListItem>

                        <asp:ListItem  Value="11">ENT</asp:ListItem> 
                        <asp:ListItem  Value="12">Ayurveda</asp:ListItem>
                        <asp:ListItem  Value="13">Paediatrician</asp:ListItem> 
                        <asp:ListItem  Value="14">Orthopedist</asp:ListItem>
                        <asp:ListItem  Value="15">Cardiologist</asp:ListItem> 
                        <asp:ListItem  Value="16">Oncologist</asp:ListItem>
                        <asp:ListItem  Value="17">Endocrinologist</asp:ListItem> 
                        <asp:ListItem Value="18">Radiologist</asp:ListItem>
                        <asp:ListItem  Value="19">Gastroenterologist</asp:ListItem> 
                        <asp:ListItem  Value="20">Pulmonologist</asp:ListItem>

                        <asp:ListItem  Value="21">Gynaecologist</asp:ListItem> 
                        <asp:ListItem  Value="22">Nutritionist</asp:ListItem>
                       <asp:ListItem  Value="23">Urologist</asp:ListItem> 
                        <asp:ListItem  Value="24">Veterinarian</asp:ListItem>
                       <asp:ListItem  Value="25">Dentist</asp:ListItem> 
                       

                   </asp:DropDownList>
                                        </div>
                                        </div>
                                     <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Qualification <asp:RequiredFieldValidator ID="RequiredFieldValidator5" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox3"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox3" class="form-control" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                     <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Experience <asp:RequiredFieldValidator ID="RequiredFieldValidator8" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox5"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox5" class="form-control" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                            <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Clinic / Hospital [Optional]</label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox10" class="form-control" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                     <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Clinic / Hospital Address [Optional]</label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox11" class="form-control" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div> 
                                    <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Profile Picture [Optional]
                                
    <asp:RegularExpressionValidator ID="RegularExpressionValidator1" ValidationGroup="one" 
        ValidationExpression="([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.png)$"
    ControlToValidate="FileUpload1" runat="server"  style="color:Red;font-weight:bold;font-size:12px;"
        ErrorMessage="Supported Formats [.jpg, .jpeg, .png]"
    Display="Dynamic" /></label>
                                        <div class="input-group">
                     <asp:FileUpload ID="FileUpload1" class="form-control" runat="server" />
                                        </div>
                                    </div>
                                     <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Quick Description <asp:RequiredFieldValidator ID="RequiredFieldValidator3" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox7"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                      <asp:TextBox ID="TextBox7" class="form-control" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                </div>
                  <asp:Button ID="Button1" runat="server" OnClick="Button1_Click" ValidationGroup="one" class="btn btn-secondary" Text="Create New Profile" />
                            </div>
                        </div>
                    </div>


                </div>

                <div class="col-md-12 col-lg-6 col-xl-12 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:6px !important;">B. Manage Onboard Doctors</h6>
                            <p style="margin-bottom:1.4rem !important;">Manage all doctors listed on the network.</p>

  <asp:panel runat="server" DefaultButton="Button5">
                               <div class="col-md-12 mb-3">
                                        <div class="input-group">
            <asp:TextBox ID="TextBox9" placeholder="Search By Keywords here..." class="form-control" runat="server"></asp:TextBox>
            <asp:Button ID="Button5" runat="server" Text="Search" OnClick="Button5_Click" />
                                        </div>
                                    </div>
     </asp:panel>

     <asp:GridView Width="100%" ID="grdImages" ShowHeaderWhenEmpty="true" runat="server" AutoGenerateColumns="False"
       
            CellPadding="4" ShowHeader="true"
            EnableModelValidation="True" 
            onrowdeleting="grdImages_RowDeleting" DataKeyNames="Id"
         
             OnRowEditing="OnRowEditing"
             OnRowCancelingEdit="OnRowCancelingEdit" OnRowUpdating="OnRowUpdating">
    <Columns> 
        <asp:TemplateField HeaderText="Profile Picture">
 <ItemTemplate>
       <asp:Image ID="Image1" style="width:120px !important;height:auto !important;padding:5px !important;" ImageUrl='<%#Eval("Path1") %>' runat="server" />
 </ItemTemplate>
             <EditItemTemplate>

                 <asp:FileUpload ID="fuEditFile" runat="server" />
                    &nbsp;<b>Picture Path</b>: <asp:Label ID="lblEditFile" Text='<%#Eval("Path1") %>' runat="server" />

                      <br/>
    <asp:RegularExpressionValidator ID="RegularExpressionValidator1bvvbcbgv" ValidationGroup="three" 
        ValidationExpression="([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.png)$"
    ControlToValidate="fuEditFile" runat="server"  style="color:Red;font-weight:bold;font-size:12px;"
        ErrorMessage="Supported Formats [.jpg, .jpeg, .png]"
    Display="Dynamic" />
                
             </EditItemTemplate>
 </asp:TemplateField>
         <asp:TemplateField HeaderText="Profile Information">
 <ItemTemplate>

<b>UID</b>: <asp:Label ID="lbldesc6jhgh" style="color:black !important"  runat="server" Text='<%#Eval("Id").ToString()%>'/><br/>
<b>Full Name</b>: <asp:Label ID="lbldesc6" style="color:black !important"  runat="server" Text='<%#Eval("Name").ToString()%>'/><br/>
<b>Qualification</b>: <asp:Label ID="Label1" style="color:black !important"  runat="server" Text='<%#Eval("Qualification").ToString()%>'/> | <b>Expertise</b>: <asp:Label ID="Label2" style="color:black !important"  runat="server" Text='<%#Eval("Profession").ToString()%>'/><br/>

<br/><br/><asp:Button ID="Button3" runat="server" CommandName="Edit" Text="Edit"></asp:Button>
<asp:Button ID="Button4" runat="server" CommandName="Delete" Text="Remove"></asp:Button>
   
 </ItemTemplate>
              <EditItemTemplate>

                  <b>UID</b> <asp:Label ID="lb1" style="color:black !important" runat="server" Text='<%#Eval("Id") %>'/><br/>
 
                  <b>Full Name</b><br/>
                  <asp:TextBox  class="form-control" ID="txt1" runat="server" Text='<%#Eval("Name") %>'/>
                 
                  <br/><asp:RequiredFieldValidator ID="RequiredFieldValvcbvcidator1448476jhgjhcbvc" ValidationGroup="three" 
                        style="color:Red;font-size:12px;" runat="server"
                         Text="Error: Full Name cannot be empty"
                         ForeColor="Red" ControlToValidate="txt1"></asp:RequiredFieldValidator>
                  
                  <br/><br/>
                  <asp:Button ID="Button1" ValidationGroup="three" CommandName="Update" runat="server" Text="Update"></asp:Button>&nbsp;<asp:Button ID="Button2" runat="server" CommandName="Cancel" Text="Cancel"></asp:Button>
                 
 </EditItemTemplate>
 </asp:TemplateField>
    </Columns>
</asp:GridView>
    
                           </div>
                        </div>
                     </div>



            </div>
        </div>
    </main>

</asp:Content>

