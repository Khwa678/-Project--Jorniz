<%@ Page Title="" Language="C#" MasterPageFile="~/System-Administrator/MasterPage.master" AutoEventWireup="true" CodeFile="New-Registration.aspx.cs" Inherits="New_Registration" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
     <asp:ScriptManager ID="ScriptManager1" runat="server"></asp:ScriptManager>
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
            border-color: #f2f2f2;
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

       <main style="margin-top: 95px !important;">
        <div class="container-fluid">
                <div class="row  ">
                <div class="col-12">
                    <h1 style="margin-bottom:0px !important;padding-bottom:0px !important;font-size:17px !important;"><b>New Registration</b> Management</h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block" style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-0" style="margin-bottom:0rem !important;padding:0px !important;">
                            <li class="breadcrumb-item active">
                                <a href="Dashboard.aspx">Dashboard</a>
                            </li>
                            <li class="breadcrumb-item">
                                <a href="#">Pending Approvals</a>
                            </li>
                        </ol>
                    </nav>
                    
                </div>
                  
                
            </div>
              <hr style="margin-top: 0.5rem !important;margin-bottom: 1rem !important;" />
             <div class="row" style="margin-top:20px !important;">

                 <div class="col-md-12 col-lg-12 col-xl-12 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">

                            <div id="success" runat="server" style="margin-bottom:20px !important;" class="alert alert-success alert-dismissible fade show mb-0" role="alert">
                                <strong>Account updated!</strong> The operation was successful.
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            
                            <div id="failed" runat="server" style="margin-bottom:20px !important;" class="alert alert-danger alert-dismissible fade show mb-0" role="alert">
                                <strong>Operation failed!</strong> Please try again later.
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>

                           

                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:3px !important;">New Account Requests</h6>
                            <p style="margin-bottom:1.4rem !important;">Following datalist allows you to accept / reject new accounts over the network.</p>

     <asp:GridView Width="100%" ID="grdImages" ShowHeaderWhenEmpty="false" runat="server" AutoGenerateColumns="False"
       CellPadding="4" ShowHeader="false"
            EnableModelValidation="True" DataKeyNames="Id" OnRowCommand="grdImages_RowCommand">
    <Columns> 
         <asp:TemplateField>
 <ItemTemplate>
       <div style="background-color:#fafafa !important;">
     <div style="padding:10px !important;">
         <p>
             
    <b>UID</b>: <asp:Label ID="lbldesc6jhgh" style="color:black !important"  runat="server" Text='<%#Eval("Id").ToString()%>'/><br/>
<b>Business Name</b>: <asp:Label ID="lbldesc6" style="color:black !important"  runat="server" Text='<%#Eval("Businessname").ToString()%>'/><br/>
<b>Name</b>: <asp:Label ID="Label1" style="color:black !important"  runat="server" Text='<%#Eval("Name").ToString()%>'/> | <b>Email</b>: <asp:Label ID="Label2" style="color:black !important"  runat="server" Text='<%#Eval("Email").ToString()%>'/> <br/> <b>Contact</b>: <asp:Label ID="Label3" style="color:black !important"  runat="server" Text='<%#Eval("Contact").ToString()%>'/> | <b>City</b>: <asp:Label ID="Label4" style="color:black !important"  runat="server" Text='<%#Eval("City").ToString()%>'/> <br/> <b>State</b>: <asp:Label ID="Label5" style="color:black !important"  runat="server" Text='<%#Eval("State").ToString()%>'/>
<b>Service Category</b>: <asp:Label ID="Label6" style="color:black !important"  runat="server" Text='<%#Eval("Servicename").ToString()%>'/>
<b>Password</b>: <asp:Label ID="Label7" style="color:black !important"  runat="server" Text='<%#Eval("Password").ToString()%>'/>

         </p>
         
         <br/>
<asp:Button ID="Button2" runat="server" CommandName="Advanced" CommandArgument='<%#Eval("Id")%>'  Text="Activate Account"  style="background-color:green !important;color:white !important;border:none !important;padding:5px 10px !important;border-radius:3px !important;"></asp:Button>
         <asp:Button ID="Button1" runat="server" CommandName="Reject" CommandArgument='<%#Eval("Id")%>'  Text="Reject"  style="background-color:darkred !important;color:white !important;border:none !important;padding:5px 10px !important;border-radius:3px !important;"></asp:Button>
   </div>
      </div>
 </ItemTemplate>
              
 </asp:TemplateField>
             <asp:TemplateField>
 <ItemTemplate>
       <div style="background-color:#fafafa !important;">
     <div style="padding:10px !important;">
    <asp:Image ID="Image2" style="width: 200px !important;height: 200px !important; padding: 20px !important;" ImageUrl='<%#Eval("Path1") %>' runat="server" />      

   </div>
      </div>
 </ItemTemplate>
              
 </asp:TemplateField>
    </Columns>
    
</asp:GridView>

 <div id="emptylist" style="width:100% !important" runat="server">
                                                    <div style="width:100% !important;margin:auto !important;padding:20px !important;border:none;margin-top:0px !important;background-color:#fafafa !important;">
                                                        <table style="width:100% !important;border:none !important;">
                                                            <tr>
                                                                <td style="padding:0px !important;width:40% !important;text-align:center !important;">
<img style="max-width:180px !important;height:auto !important;margin:auto !important;float:right !important;margin-right:30px !important;" src="Images/noitem1.png" />
                                                                </td>
                                                                <td style="padding:0px !important;width:60% !important">
<h2 style="padding-top:10px;font-size:21px !important;color:#00365a !important;font-weight:bold !important;margin-bottom: 0.2rem !important;">No Records Found!</h2>
                          <p>Nothing here which requires your attention right now.</p>
                          <a class="btn btn-secondary" style="border-radius:3px !important;margin-top:15px !important;" href="Dashboard.aspx">Return Home</a>
                                                                </td>
                                                            </tr>
                                                            </table>
                                                    </div>
                                                </div>

                            </div>
                        </div>
                     </div>

            </div>
        </div>
    </main>
</asp:Content>

