<%@ Page Title="" Language="C#" MasterPageFile="~/Vendor-Panel/MasterPage.master" AutoEventWireup="true" CodeFile="Support.aspx.cs" Inherits="Vendor_Panel_Support" %>

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
     <main style="margin-top: 75px !important;">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">

                    <h1 style="margin-bottom:15px !important;padding-bottom:0px !important;font-size:21px !important;font-weight:bold !important;margin-top: 15px !important;">Member Management / Member UID:HVA000<b><asp:Label ID="Label10" runat="server" style="color:#008000 !important"></asp:Label></b>  </h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block"  style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-15" style="margin-bottom:0rem !important;">
                            <li class="breadcrumb-item">
                                <a href="Dashboard.aspx">Dashboard</a>
                            </li>
                           
                            <li class="breadcrumb-item active" aria-current="page">Support Center </li>
                        </ol>
                    </nav>
                    <div class="separator mb-5"></div>

                </div>
            </div>

            <div class="row">
          
                <div class="col-md-12 col-lg-10 col-xl-8 mb-4" style="margin:auto !important">
                    <div class="card mb-4">
                        <div class="card-body">
                             <div id="success" runat="server" style="margin-bottom:20px !important;" class="alert alert-success alert-dismissible fade show mb-0" role="alert">
                                <strong>Thank you for your submission!</strong>
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
                               <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;letter-spacing:0.4px !important;margin-bottom:6px !important;">Do you have any questions?</h6>
                            <p style="margin-bottom:1.4rem !important;">Just use the form given below and a support executive will get in touch rightaway. Feel free to contact us or send us a message anytime.</p>
                      
                                
                                       
                                 <div class="form-row">
      
                       <div class="col-md-12 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;font-weight:bold !important;">Related a query*  <asp:RequiredFieldValidator ID="RequiredFieldValidator1" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox1"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                     <asp:TextBox ID="TextBox1" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                     
                       <div class="col-md-12 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;font-weight:bold !important;">Write Your Query*  <asp:RequiredFieldValidator ID="RequiredFieldValidator2" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox1"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                     <asp:TextBox ID="TextBox2" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" TextMode="MultiLine" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                    
                                
                           
                     
                         
                                
                                   <asp:Button ID="Button1" OnClick="Button1_Click" runat="server" ValidationGroup="one" class="btn btn-secondary"
                                Text="Submit" />      
      </div>
                                    </div>
                             </div>
                           </div>
                     
                              <div class="col-md-12 col-lg-12 col-xl-12 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;letter-spacing:0.4px !important;margin-bottom:6px !important;">Total Query List</h6>
                            <p style="margin-bottom:1.4rem !important;">Query listed over the network.</p>
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
         <asp:TemplateField HeaderText="Query Id">
 <ItemTemplate>
 <b>QUERY ID</b>: QID000<asp:Label ID="lbldesc6jhgh" style="color:black !important"  runat="server" Text='<%#Eval("Id").ToString()%>'/>
 <br/><br/>
 

 </ItemTemplate>
 </asp:TemplateField>
   
       <asp:TemplateField HeaderText="Your Query">
 <ItemTemplate>
 <asp:Label ID="lbldesc6jhgh" style="color:black !important"  runat="server" Text='<%#Eval("Dquery").ToString()%>'/>
 <br/><br/>
 

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
<h2 style="padding-top:30px;font-size:22px !important;color:#00365a !important;font-weight:bold !important;">No Query Found!</h2>
                          <p>No Query records were found in the database.</p>
                          
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

