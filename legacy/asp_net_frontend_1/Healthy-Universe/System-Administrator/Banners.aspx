<%@ Page Title="" Language="C#" MasterPageFile="~/System-Administrator/MasterPage.master" AutoEventWireup="true" CodeFile="Banners.aspx.cs" Inherits="System_Administrator_Banners" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
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

       <main style="margin-top: 85px !important;">
        <div class="container-fluid">
           <div class="row  ">
                <div class="col-12">
                    <h1 style="margin-bottom:0px !important;padding-bottom:0px !important;font-size:17px !important;"><b>Front Display Banner</b> Management</h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block" style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-0" style="margin-bottom:0rem !important;padding:0px !important;">
                            <li class="breadcrumb-item active">
                                <b>Dashboard</b>
                            </li>
                            <li class="breadcrumb-item">
                                <a href="#">Banner Management</a>
                            </li>
                        </ol>
                    </nav>
                    
                </div>
                  
                
            </div>
            <hr style="margin-top: 0.5rem !important;margin-bottom: 1.5rem !important;" />
             <div class="row" style="margin-top:20px !important;">
                <div id="success" runat="server" style="margin-bottom:20px !important;" class="alert alert-success alert-dismissible fade show mb-0" role="alert">
                                <strong>Database Records updated!</strong> The operation was successful.
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
                <div class="col-md-12 col-lg-6 col-xl-12 mb-4" style="margin-bottom:0.5rem !important;">

                    <div id="videoavailable" runat="server" class="card mb-4" style="padding:10px !important;">
                          <div class="row">
                        <div class="col-md-12 col-lg-6 col-xl-9">
                                        <label for="validationTooltipUsername2" style="width:100% !important;margin-bottom:0rem !important;"><b>Change Existing Banner Video</b> <asp:RequiredFieldValidator ID="RequiredFieldValidator1" ValidationGroup="one1" 
                        style="color:Red;font-weight:bold;font-size:12px;float:right !important;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="FileUpload2"></asp:RequiredFieldValidator> <asp:RegularExpressionValidator ID="RegularExpressionValidator2" ValidationGroup="one1" 
        ValidationExpression="([a-zA-Z0-9\s_\\.\-:])+(.mp4|.MP4)$"
    ControlToValidate="FileUpload2" runat="server"  style="color:Red;font-weight:bold;font-size:12px;float:right !important;"
        ErrorMessage="Supported Formats [.mp4, .MP4]"
    Display="Dynamic" /></label>
                                     
                                        <div class="input-group" style="border:none !important;">
                                          <asp:FileUpload ID="FileUpload2" class="form-control"  style="border:none !important;" runat="server" />
                                        </div>
                                       
                                    </div>
                          <div class="col-md-12 col-lg-6 col-xl-3">
                                <asp:Button ID="Button7" runat="server" style="margin-top:25px !important;float:right !important;margin-left:10px !important;border-radius:3px !important;" class="btn btn-primary" onclick="Button7_Click" Text="Remove" />
                        <asp:Button ID="Button5" runat="server" ValidationGroup="one1" style="margin-top:25px !important;float:right !important;border-radius:3px !important;" class="btn btn-primary" onclick="Button5_Click" Text="Change" />
                      
                        </div>
                              </div></div>
                    <div id="videounavailable" runat="server" class="card mb-4" style="padding:10px !important;">
                          <div class="row">
                        <div class="col-md-12 col-lg-6 col-xl-9">
                                        <label for="validationTooltipUsername2" style="width:100% !important;margin-bottom:0rem !important;"><b>Upload a Banner Video</b> <asp:RequiredFieldValidator ID="RequiredFieldValidator3" ValidationGroup="two2" 
                        style="color:Red;font-weight:bold;font-size:12px;float:right !important;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="FileUpload3"></asp:RequiredFieldValidator> <asp:RegularExpressionValidator ID="RegularExpressionValidator3" ValidationGroup="two2" 
        ValidationExpression="([a-zA-Z0-9\s_\\.\-:])+(.mp4|.MP4)$"
    ControlToValidate="FileUpload3" runat="server"  style="color:Red;font-weight:bold;font-size:12px;float:right !important;"
        ErrorMessage="Supported Formats [.mp4, .MP4]"
    Display="Dynamic" /></label>
                                     
                                        <div class="input-group" style="border:none !important;">
                                          <asp:FileUpload ID="FileUpload3" class="form-control"  style="border:none !important;" runat="server" />
                                        </div>
                                       
                                    </div>
                           <div class="col-md-12 col-lg-6 col-xl-3">
                        <asp:Button ID="Button6" runat="server" style="margin-top:25px !important;float:right !important;border-radius:3px !important;" ValidationGroup="two2" class="btn btn-primary" OnClick="Button6_Click" Text="Add Video To Banner" />
                        </div>
                    </div></div>
                    </div>
                </div>


            <div class="row">

                <div class="col-md-12 col-lg-6 col-xl-4 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                             


                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:6px !important;">A. Add a Banner</h6>
                            <p style="margin-bottom:1.4rem !important;">Add a new banner to the frontpage.</p>

                            <div class="needs-validation mb-5">
                                
                                <div class="form-row">
                                   
                                    <div class="col-md-12 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Link To Page <asp:RequiredFieldValidator ID="reg1" ValidationGroup="one" 
                        style="color:Red;font-size:12px;float:right !important;" runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="TextBox1"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                                        <asp:TextBox ID="TextBox1" class="form-control" style="color:darkslateblue !important;"
                                            placeholder="Type here..." runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                      
                                   <div class="col-md-12 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Display Banner <asp:RequiredFieldValidator ID="RequiredFieldValidator2" ValidationGroup="one" 
                        style="color:Red;font-weight:bold;font-size:12px;float:right !important;"  runat="server"
                         Text="*"
                         ForeColor="Red" ControlToValidate="FileUpload1"></asp:RequiredFieldValidator> <asp:RegularExpressionValidator ID="RegularExpressionValidator1" ValidationGroup="one" 
        ValidationExpression="([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.png)$"
    ControlToValidate="FileUpload1" runat="server"  style="color:Red;font-weight:bold;font-size:12px;float:right !important;"
        ErrorMessage="Supported Formats [.jpg, .jpeg, .png]"
    Display="Dynamic" /></label>
                                     
                                        <div class="input-group">
                                          <asp:FileUpload ID="FileUpload1" class="form-control" runat="server" />
                                        </div>
                                       
                                    </div>
                                   

                                </div>
                              <asp:Button ID="Button1" ValidationGroup="one" class="btn btn-secondary" style="border-radius:3px !important;" runat="server" OnClick="Button1_Click" Text="Add New Banner" />
                          
                            </div>


                          
                        </div>
                    </div>


                </div>

                 <div class="col-md-12 col-lg-6 col-xl-8 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:6px !important;">B. Existing Banners</h6>
                            <p style="margin-bottom:1.4rem !important;">Manage banners listed on the network.</p>

                            <asp:GridView Width="100%" ID="grdImages" ShowHeaderWhenEmpty="true" runat="server" AutoGenerateColumns="False" 
            CellPadding="4" ShowHeader="true"
            EnableModelValidation="True" 
            onrowdeleting="grdImages_RowDeleting" DataKeyNames="Id"
             OnRowEditing="grdImages_RowEditing"
             OnRowCancelingEdit="grdImages_RowCancelingEdit" OnRowUpdating="grdImages_RowUpdating">
    <Columns> 
         <asp:TemplateField>
 <ItemTemplate>
 <asp:Label ID="lbl1" style="color:black !important"  runat="server" Text='<%#Eval("Id").ToString()%>'/>
 </ItemTemplate>
 <EditItemTemplate>
 <asp:Label ID="lb2" style="color:black !important" runat="server" Text='<%#Eval("Id") %>'/>
 </EditItemTemplate>
 </asp:TemplateField>
   
        <asp:TemplateField HeaderText="Link To Page">
 <ItemTemplate>
     
    <asp:Label ID="lbl3" style="color:black !important"  runat="server" Text='<%#Eval("Title").ToString()%>'/>
  
 </ItemTemplate>
             <EditItemTemplate>

 <asp:TextBox  ID="txt1" class="form-control" runat="server" Text='<%#Eval("Title") %>'/>
               
      <br/><asp:RequiredFieldValidator ID="reg1" ValidationGroup="three" 
                        style="color:Red;font-size:12px;" runat="server"
                         Text="Error: Link cannot be empty"
                         ForeColor="Red" ControlToValidate="txt1"></asp:RequiredFieldValidator>
                
      
 </EditItemTemplate>
 </asp:TemplateField>
         <asp:TemplateField HeaderText="Banner">
                <ItemTemplate>
                    <asp:Image ID="Image1" style="width:auto !important;max-width:150px !important;height:auto !important;" ImageUrl='<%#Eval("Path1") %>' runat="server" />
                </ItemTemplate>
                 <EditItemTemplate>
                       <asp:Image ID="Image2" style="width:auto !important;max-width:150px !important;height:auto !important;" ImageUrl='<%#Eval("Path1") %>' runat="server" />
                       <asp:FileUpload ID="fuEditFile" class="form-control" runat="server" />
                     <br/>
           <asp:RequiredFieldValidator ID="RequiredFieldValvcbvcidator1448476jhgjhbvvcb" ValidationGroup="three" 
          style="color:Red;font-size:12px;" runat="server"
                         Text="Error: Banner cannot be empty"
                         ForeColor="Red" ControlToValidate="fuEditFile"></asp:RequiredFieldValidator>
                     <br/>
    <asp:RegularExpressionValidator ID="RegularExpressionValidator1bvvbcbgv" ValidationGroup="three" 
        ValidationExpression="([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.png)$"
    ControlToValidate="fuEditFile" runat="server"  style="color:Red;font-weight:bold;font-size:12px;"
        ErrorMessage="Please select a valid image file [.jpg, .jpeg, .png] for banner"
    Display="Dynamic" />
                 </EditItemTemplate>
            </asp:TemplateField>
         

         <asp:TemplateField HeaderText="Options">
<EditItemTemplate>
<asp:Button ID="Button1" ValidationGroup="three" CommandName="Update" runat="server" Text="Update"></asp:Button>&nbsp;<asp:Button ID="Button2" runat="server" CommandName="Cancel" Text="Cancel"></asp:Button>
</EditItemTemplate>
<ItemTemplate>
<asp:Button ID="Button3" runat="server" CommandName="Edit" Text="Edit"></asp:Button>
<asp:Button ID="Button4" runat="server" CommandName="Delete" Text="Remove"></asp:Button>
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
<h2 style="padding-top:30px;font-size:19px !important;color:#00365a !important;font-weight:bold !important;">Display Banners Not Found!</h2>
                          <p>No banners were found in the database. It is recommended to add banners for full website preview.</p>
                          
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

