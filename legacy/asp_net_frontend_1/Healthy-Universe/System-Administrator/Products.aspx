<%@ Page Title="" Language="C#" MasterPageFile="~/System-Administrator/MasterPage.master" AutoEventWireup="true" MaintainScrollPositionOnPostback="true" CodeFile="Products.aspx.cs" Inherits="System_Administrator_Products" %>

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
          img {
    vertical-align: middle;
    border-style: none;
    height: 21px;
}
    </style>
<main style="margin-top: 85px !important;">
        <div class="container-fluid">
            <div class="row  ">
                <div class="col-12">
                    <h1 style="margin-bottom:0px !important;padding-bottom:0px !important;font-size:17px !important;"><b>Product</b> Management</h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block" style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-0" style="margin-bottom:0rem !important;padding:0px !important;">
                            <li class="breadcrumb-item active">
                                <b>Dashboard</b>
                            </li>
                            <li class="breadcrumb-item">
                                <a href="#">Manage Products</a>
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


                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:6px !important;">A. List a New Product</h6>
                            <p style="margin-bottom:1.4rem !important;">Add a new product to the network.</p>
                             
                            <div class="needs-validation mb-5">
                                
                                <div class="form-row">


                                   

                                   <%-- starts here--%>

                                   
                          
                   <div class="col-md-12 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Product Title  <asp:RequiredFieldValidator ID="RequiredFieldValidator1" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox2"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                     <asp:TextBox ID="TextBox2" class="form-control" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>

                           
                           <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Product Description</label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox4" class="form-control" TextMode="MultiLine" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>

                                   
                        
                           <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Weight / Nos.  <asp:RequiredFieldValidator ID="RequiredFieldValidator3sx" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox1"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                       <asp:TextBox ID="TextBox1" class="form-control" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>

                                  <script type="text/javascript">
                                      function validateFloatKeyPress(el) {
                                          var v = parseFloat(el.value);
                                          el.value = (isNaN(v)) ? '' : v.toFixed(2);
                                      }
                                  </script>

                                <label for="validationTooltipUsername2" style="width:100% !important;margin-top:10px !important;">List Price <asp:RequiredFieldValidator ID="RequiredFieldValidator4" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox6"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                     <asp:TextBox ID="TextBox6" class="form-control" onchange="validateFloatKeyPress(this);" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>

                                 <label for="validationTooltipUsername2" style="width:100% !important;margin-top:10px !important;">Retail Price <asp:RequiredFieldValidator ID="RequiredFieldValidator6" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox8"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                     <asp:TextBox ID="TextBox8" class="form-control" onchange="validateFloatKeyPress(this);" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>

                                   

                                    </div>

                         
     <div class="col-md-12 mb-3">
           <div class="input-group">
                   <asp:DropDownList class="form-control" ID="DropDownList3" runat="server">
    <asp:ListItem Value="0">Out Of Stock</asp:ListItem>
    <asp:ListItem Selected="True" Value="1">In Stock</asp:ListItem>
</asp:DropDownList>
                                        </div>
         </div>
                          
                         
                        <asp:UpdatePanel ID="Update1" style="width:100% !important;" runat="server">
                            <ContentTemplate>

                         
                   <div class="col-md-12 mb-3" style="padding-right: 5px !important;padding-left: 5px !important;">
                                        <div class="input-group">
                       <asp:DropDownList ID="DropDownList1" OnSelectedIndexChanged="DropDownList1_SelectedIndexChanged" AutoPostBack="true" class="form-control" runat="server"></asp:DropDownList>
                                        </div>
                                    </div>
                         
                               <div class="col-md-12 mb-3" style="padding-right: 5px !important;padding-left: 5px !important;">
                                        <div class="input-group">
                       <asp:DropDownList ID="DropDownList2" Enabled="false" class="form-control" OnSelectedIndexChanged="DropDownList2_SelectedIndexChanged" AutoPostBack="true" runat="server"></asp:DropDownList>
                                        </div>
                                    </div>

                                <div class="col-md-12 mb-3" style="padding-right: 5px !important;padding-left: 5px !important;">
                                        <div class="input-group">
                       <asp:DropDownList ID="DropDownList4" Enabled="false" class="form-control" runat="server"></asp:DropDownList>
                                        </div>
                                    </div>
                                </ContentTemplate>
                            </asp:UpdatePanel>
    
                           
                                       <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Banner <asp:RequiredFieldValidator ID="RequiredFieldValidator2" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="FileUpload1"></asp:RequiredFieldValidator>
                                
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
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Optional Banner <asp:RegularExpressionValidator ID="RegularExpressionValidator4" ValidationGroup="one" 
        ValidationExpression="([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.png)$"
    ControlToValidate="FileUpload4" runat="server"  style="color:Red;font-weight:bold;font-size:12px;"
        ErrorMessage="Supported Formats [.jpg, .jpeg, .png]"
    Display="Dynamic" /></label>
                                        <div class="input-group">
                     <asp:FileUpload ID="FileUpload4" class="form-control" runat="server" />
                                        </div>
                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Optional Banner <asp:RegularExpressionValidator ID="RegularExpressionValidator5" ValidationGroup="one" 
        ValidationExpression="([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.png)$"
    ControlToValidate="FileUpload5" runat="server"  style="color:Red;font-weight:bold;font-size:12px;"
        ErrorMessage="Supported Formats [.jpg, .jpeg, .png]"
    Display="Dynamic" /></label>
                                        <div class="input-group">
                     <asp:FileUpload ID="FileUpload5" class="form-control" runat="server" />
                                        </div>
                                    </div>

                                 

                       
                          
                    
                              

                                     <div class="col-md-5 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Description Tag</label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox3" class="form-control" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                     <div class="col-md-5 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Keywords</label>
                                        <div class="input-group">
                    <asp:TextBox ID="TextBox5" class="form-control" style="color:darkslateblue !important;" placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                       

                                    

                                </div>

                                   
                  <asp:Button ID="Button1" runat="server" OnClick="Button1_Click" ValidationGroup="one" class="btn btn-secondary"
                      Text="Create Product Listing" />
                           
                             
                            </div>


                          
                        </div>
                    </div>


                </div>

                <div class="col-md-12 col-lg-6 col-xl-12 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:6px !important;">B. Manage Listed Products</h6>
                            <p style="margin-bottom:1.4rem !important;">Manage all products listed on the network.</p>

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
             OnRowCancelingEdit="OnRowCancelingEdit" OnRowUpdating="OnRowUpdating"
    OnPageIndexChanging="grdImages_PageIndexChanging" EmptyDataText="There Is No Records In Database!"
    AllowPaging="true" PageSize="10" AllowSorting="true" OnSorting="grdImages_Sorting"> 
    <Columns> 
         <asp:TemplateField HeaderText="Product Information">
 <ItemTemplate>
 <b>Product ID</b>: <asp:Label ID="lbldesc6jhgh" style="color:black !important"  runat="server" Text='<%#Eval("Id").ToString()%>'/><br/>
<b>Title</b>: <asp:Label ID="lbldesc6" style="color:black !important"  runat="server" Text='<%#Eval("Title").ToString()%>'/><br/>
  
   <%--  <b>Quantity</b>: <asp:Label ID="lblquantity" style="color:black !important"  runat="server" Text='<%#Eval("Quantity").ToString()%>'/><br/>
     <b>Weight / Nos.</b>: <asp:Label ID="Label2" style="color:black !important"  runat="server" Text='<%#Eval("Weight").ToString()%>'/><br/>--%>
 <b>Listing Price</b>: <asp:Label ID="lbldesc6bvcb" style="color:black !important"  runat="server" Text='<%#Eval("Price").ToString()%>'/> INR | <b>Max. Retail Price</b>: <asp:Label ID="Label1" style="color:black !important"  runat="server" Text='<%#Eval("Price1").ToString()%>'/> INR<br/>

<br/><b>Description Tag</b>: <asp:Label ID="Label6" style="color:black !important"  runat="server" Text='<%#Eval("Dtag").ToString()%>'/>
<br/><b>Keywords</b>: <asp:Label ID="Label7" style="color:black !important"  runat="server" Text='<%#Eval("Ktag").ToString()%>'/>
    
 <br/><br/><asp:Button ID="Button3" runat="server" CommandName="Edit" Text="Edit"></asp:Button>
<asp:Button ID="Button4" runat="server" CommandName="Delete" Text="Remove"></asp:Button>
   
 </ItemTemplate>
              <EditItemTemplate>
<b>Product ID</b> <asp:Label ID="lb1" style="color:black !important" runat="server" Text='<%#Eval("Id") %>'/><br/>
 
                   
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
   



         <asp:TemplateField HeaderText="Product Gallery">
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
        ValidationExpression="([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.png)$"
    ControlToValidate="fuEditFile" runat="server"  style="color:Red;font-weight:bold;font-size:12px;"
        ErrorMessage="Supported Banner Formats [.jpg, .jpeg, .png]"
    Display="Dynamic" />
                
                  <br/>
    <asp:RegularExpressionValidator ID="RegularExpressionValidator7" ValidationGroup="three" 
        ValidationExpression="([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.png)$"
    ControlToValidate="FileUpload7" runat="server"  style="color:Red;font-weight:bold;font-size:12px;"
        ErrorMessage="Supported Banner Formats [.jpg, .jpeg, .png]"
    Display="Dynamic" />
                  <br/>
    <asp:RegularExpressionValidator ID="RegularExpressionValidator8" ValidationGroup="three" 
        ValidationExpression="([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.png)$"
    ControlToValidate="FileUpload8" runat="server"  style="color:Red;font-weight:bold;font-size:12px;"
        ErrorMessage="Supported Banner Formats [.jpg, .jpeg, .png]"
    Display="Dynamic" />
               
             </EditItemTemplate>
 </asp:TemplateField>
       
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
         

        
    </Columns>
    
</asp:GridView>
    
     </div>
                        </div>
                     </div>



            </div>
        </div>
    </main>


    
     




</asp:Content>

