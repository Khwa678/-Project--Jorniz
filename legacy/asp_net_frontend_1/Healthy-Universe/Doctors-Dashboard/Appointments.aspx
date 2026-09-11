<%@ Page Title="" Language="C#" MasterPageFile="~/Doctors-Dashboard/MasterPage.master" AutoEventWireup="true" CodeFile="Appointments.aspx.cs" Inherits="Doctors_Dashboard_Appointments" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
      <main style="margin-top: 75px !important;">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">

                    <h1 style="margin-bottom:15px !important;padding-bottom:0px !important;font-size:21px !important;font-weight:bold !important;margin-top: 15px !important;"> Appointments Lists</h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block"  style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-15" style="margin-bottom:0rem !important;">
                            <li class="breadcrumb-item">
                                <a href="Dashboard.aspx">Dashboard</a>
                            </li>
                           
                            <li class="breadcrumb-item active" aria-current="page">Pending Appointments </li>
                        </ol>
                    </nav>
                    <div class="separator mb-5"></div>

                </div>
            </div>
              <div class="row" style="margin-top:20px !important;">
                 
                <div class="col-md-12 col-lg-6 col-xl-12 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:6px !important;">A. Manage Listed Appointment</h6>
                            <p style="margin-bottom:1.4rem !important;">Manage all Appointment listed on the network.</p>

 <asp:panel runat="server" DefaultButton="Button5">
                               <div class="col-md-12 mb-3">
                                        <div class="input-group">
            <asp:TextBox ID="TextBox7" placeholder="Search By Keywords here..." class="form-control" runat="server"></asp:TextBox>
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
         <asp:TemplateField HeaderText="Test Information">
 <ItemTemplate>
 <b>Test ID</b>: <asp:Label ID="lbldesc6jhgh" style="color:black !important"  runat="server" Text='<%#Eval("Id").ToString()%>'/> <b>Status</b>: <asp:Label ID="Label2" style="color:black !important"  runat="server" Text='<%#Eval("Status").ToString()%>'/><br/>
<b>Title</b>: <asp:Label ID="lbldesc6" style="color:black !important"  runat="server" Text='<%#Eval("Title").ToString()%>'/><br/>
  
   <%--  <b>Quantity</b>: <asp:Label ID="lblquantity" style="color:black !important"  runat="server" Text='<%#Eval("Quantity").ToString()%>'/><br/>
     <b>Weight / Nos.</b>: <asp:Label ID="Label2" style="color:black !important"  runat="server" Text='<%#Eval("Weight").ToString()%>'/><br/>--%>
 <b>Listing Price</b>: <asp:Label ID="lbldesc6bvcb" style="color:black !important"  runat="server" Text='<%#Eval("Price").ToString()%>'/> INR | <b>Max. Retail Price</b>: <asp:Label ID="Label1" style="color:black !important"  runat="server" Text='<%#Eval("Price1").ToString()%>'/> INR

<br/><b>Sample Required</b>: <asp:Label ID="Label6" style="color:black !important"  runat="server" Text='<%#Eval("Dtag").ToString()%>'/>
<br/><b>Preparations</b>: <asp:Label ID="Label7" style="color:black !important"  runat="server" Text='<%#Eval("Ktag").ToString()%>'/>
    
 <br/><br/><%--<asp:Button ID="Button3" runat="server" CommandName="Edit" Text="Edit"></asp:Button>--%>
<asp:Button ID="Button4" runat="server" CommandName="Delete" Text="Remove"></asp:Button>
   
 </ItemTemplate>
              <EditItemTemplate>
<b>Test ID</b> <asp:Label ID="lb1" style="color:black !important" runat="server" Text='<%#Eval("Id") %>'/><br/>
 
                   
                  <script type="text/javascript">
                      function validateFloatKeyPress(el) {
                          var v = parseFloat(el.value);
                          el.value = (isNaN(v)) ? '' : v.toFixed(2);
                      }
                  </script>

                  <b>Title</b><br/>
                   <asp:TextBox  class="form-control" ID="txt4xyzx1" runat="server" Text='<%#Eval("Title") %>'/>
                 
                  <b>Weight / Nos.</b><br/>
                   <asp:TextBox  class="form-control" ID="TextBox1xyz" runat="server" Text='<%#Eval("Weight") %>'/>

                  <b>Manage Availability</b><br/> 
                  <asp:DropDownList  class="form-control" style="padding: 5px 18px !important;" ID="DropDownList3" runat="server">
                            <asp:ListItem Value="0">Out Of Stock</asp:ListItem>
                            <asp:ListItem Value="1">In Stock</asp:ListItem>
                  </asp:DropDownList>

                   
                  
                  <b>Listing Price</b><br/>
                   <asp:TextBox  class="form-control" ID="txt4xyzx2" onchange="validateFloatKeyPress(this);" runat="server" Text='<%#Eval("Price") %>'/>

                    <b>Max. Retail Price</b><br/>
                   <asp:TextBox  class="form-control" ID="TextBox9" onchange="validateFloatKeyPress(this);" runat="server" Text='<%#Eval("Price1") %>'/>

                   <b>Description Tag</b><br/>
                     <asp:TextBox ID="txt1"  class="form-control" placeholder="Type here..." runat="server"  Text='<%#Eval("Dtag") %>'></asp:TextBox>
                                      
                   <b>Keywords Tag</b><br/>
                      <asp:TextBox ID="txt2" class="form-control" placeholder="Type here..." runat="server"  Text='<%#Eval("Ktag") %>'></asp:TextBox>
                                       
                 
                    <br/><asp:RequiredFieldValidator ID="RequiredFieldValvcbvcidator1448476jhgjhcbvc" ValidationGroup="three" 
                        style="color:Red;font-size:12px;" runat="server"
                         Text="Error: Title cannot be empty"
                         ForeColor="Red" ControlToValidate="txt4xyzx1"></asp:RequiredFieldValidator>
                  
                   <br/><asp:RequiredFieldValidator ID="RequiredFieldValidator3" ValidationGroup="three" 
                        style="color:Red;font-size:12px;" runat="server"
                         Text="Error: Weight / Nos. cannot be empty"
                         ForeColor="Red" ControlToValidate="TextBox1xyz"></asp:RequiredFieldValidator>
                   <br/><asp:RequiredFieldValidator ID="RequiredFieldValvcbvcidator1448476jhgjhvxvc" ValidationGroup="three" 
                        style="color:Red;font-size:12px;" runat="server"
                         Text="Error: List Price cannot be empty"
                         ForeColor="Red" ControlToValidate="txt4xyzx2"></asp:RequiredFieldValidator>
                   <br/><asp:RequiredFieldValidator ID="RequiredFieldValidator7" ValidationGroup="three" 
                        style="color:Red;font-size:12px;" runat="server"
                         Text="Error: Retail Price cannot be empty"
                         ForeColor="Red" ControlToValidate="TextBox9"></asp:RequiredFieldValidator>
                  <br/><br/>
                  <asp:Button ID="Button1" ValidationGroup="three" CommandName="Update" runat="server" Text="Update"></asp:Button>&nbsp;<asp:Button ID="Button2" runat="server" CommandName="Cancel" Text="Cancel"></asp:Button>
                 
 </EditItemTemplate>
 </asp:TemplateField>
   



         <asp:TemplateField HeaderText="Test Gallery">
 <ItemTemplate>
 <%--<asp:Label ID="lbldesc6hfjhg1" style="color:black !important"  runat="server" Text="View On Edit" />--%>
   
       <asp:Image ID="Image1" style="width:120px !important;height:auto !important;padding:5px !important;" ImageUrl='<%#Eval("Path1") %>' runat="server" />
       <asp:Image ID="Image2" style="width:120px !important;height:auto !important;padding:5px !important;" ImageUrl='<%#Eval("Path3") %>' runat="server" />
       <asp:Image ID="Image3" style="width:120px !important;height:auto !important;padding:5px !important;" ImageUrl='<%#Eval("Path4") %>' runat="server" />
       
 </ItemTemplate>
             <EditItemTemplate>
 <asp:TextBox  class="form-control" TextMode="MultiLine" style="max-height:200px !important;" ID="txt4xyzx1231" runat="server" Text='<%#Eval("Description") %>'/>
  <br/><br/>
                 <asp:FileUpload ID="fuEditFile" runat="server" />
                    &nbsp;<b>Banner Path</b>: <asp:Label ID="lblEditFile" Text='<%#Eval("Path1") %>' runat="server" />

                     

                 <br/> <asp:FileUpload ID="FileUpload7" runat="server" />
                    &nbsp;<b>Banner Path</b>: <asp:Label ID="Label4" Text='<%#Eval("Path3") %>' runat="server" />

                 <br/> <asp:FileUpload ID="FileUpload8" runat="server" />
                    &nbsp;<b>Banner Path</b>: <asp:Label ID="Label5" Text='<%#Eval("Path4") %>' runat="server" />

                 

                 

                      <br/>
    <asp:RegularExpressionValidator ID="RegularExpressionValidator1bvvbcbgv" ValidationGroup="three" 
        Validationexpression="([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.png)$"
    ControlToValidate="fuEditFile" runat="server"  style="color:Red;font-weight:bold;font-size:12px;"
        ErrorMessage="Supported Banner Formats [.jpg, .jpeg, .png]"
    Display="Dynamic" />
                
                  <br/>
    <asp:RegularExpressionValidator ID="RegularExpressionValidator7" ValidationGroup="three" 
        Validationexpression="([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.png)$"
    ControlToValidate="FileUpload7" runat="server"  style="color:Red;font-weight:bold;font-size:12px;"
        ErrorMessage="Supported Banner Formats [.jpg, .jpeg, .png]"
    Display="Dynamic" />
                  <br/>
    <asp:RegularExpressionValidator ID="RegularExpressionValidator8" ValidationGroup="three" 
        Validationexpression="([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.png)$"
    ControlToValidate="FileUpload8" runat="server"  style="color:Red;font-weight:bold;font-size:12px;"
        ErrorMessage="Supported Banner Formats [.jpg, .jpeg, .png]"
    Display="Dynamic" />
               
             </EditItemTemplate>
 </asp:TemplateField>
   <%--    
             <asp:TemplateField>
            <HeaderTemplate>
                Sort by filter
                <asp:DropDownList ID="section" runat="server" SortExpression="section"
                    AutoPostBack="true" OnSelectedIndexChanged="DeptChanged"
                    AppendDataBoundItems="true">
                      <asp:ListItem Text="ALL" Value="ALL"></asp:ListItem>
                    <asp:ListItem Text="Latest" Value="10"></asp:ListItem>
                  
                </asp:DropDownList>
            </HeaderTemplate>
          
        </asp:TemplateField>
         

        --%>
    </Columns>
    
</asp:GridView>
    
     </div>
                        </div>
                     </div>


            </div>
            </div>
          
                       <div id="emptylist" style="width:100% !important" runat="server">
                                                    <div style="width:100% !important;margin:auto !important;padding:20px !important;border:solid #f2f2f2 thin !important;margin-top:20px !important;background-color:#fafafa !important;">
                                                        <table style="width:100% !important">
                                                            <tr>
                                                                <td style="padding:0px !important;width:40% !important;text-align:center !important;">
<img style="width:100% !important;height:auto !important;margin:auto !important" src="Images/Appoitments.jpg" />
                                                                </td>
                                                                <td style="padding:0px !important;width:60% !important">
<h2 style="padding-top:30px;font-size:22px !important;color:#00365a !important;font-weight:bold !important;">No New Appointment Found!</h2>
                          <p>There is nothing important here which requires your attention right now.</p>
                          
                                                                </td>
                                                            </tr>
                                                            </table>
                                                    </div>
                                                </div>
</main>
</asp:Content>

