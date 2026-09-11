<%@ Page Title="" Language="C#" MasterPageFile="~/System-Administrator/MasterPage.master" AutoEventWireup="true" CodeFile="Featured.aspx.cs" Inherits="System_Administrator_Featured" %>

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
                    <h1 style="margin-bottom:0px !important;padding-bottom:0px !important;font-size:17px !important;"><b>Featured</b> Override Management</h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block" style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-0" style="margin-bottom:0rem !important;padding:0px !important;">
                            <li class="breadcrumb-item active">
                                <b>Dashboard</b>
                            </li>
                            <li class="breadcrumb-item">
                                <a href="#">List as Featured</a>
                            </li>
                        </ol>
                    </nav>
                    
                </div>
                  
                
            </div>
              <hr style="margin-top: 0.5rem !important;margin-bottom: 1rem !important;" />


            <div class="row">

                   <script type="text/javascript">
                       function isNumberKey(evt) {
                           var charCode = (evt.which) ? evt.which : evt.keyCode;
                           if (charCode > 31 && (charCode < 48 || charCode > 57))
                               return false;
                           return true;
                       }
   </script>

                 <div class="col-md-12 col-lg-6 col-xl-12 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                          

                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:6px !important;">Override Featured Listing</h6>
                            <p style="margin-bottom:1.4rem !important;">Following data helps in assigning your products as Featured listing.</p>
  <div class="col-md-12 mb-3"  style="padding-right: 5px !important;padding-left: 5px !important;">
                                      
                                        <div class="input-group">
 <asp:DropDownList ID="DropDownList2" CssClass="form-control" OnSelectedIndexChanged="DropDownList2_SelectedIndexChanged"
     AutoPostBack="true" runat="server">
    </asp:DropDownList>  
                                            </div>
      </div>

      <asp:GridView ID="GridView1" DataKeyNames="Id" runat="server" AutoGenerateColumns="false">
    <Columns>
         <asp:TemplateField>
        <ItemTemplate>
            <asp:CheckBox ID="chkSelect" runat="server" Checked='<%# Eval("IsSelected") %>' />
        </ItemTemplate>
    </asp:TemplateField>
        <asp:BoundField DataField="Title" HeaderText="Product"  />
        <asp:BoundField DataField="Price" HeaderText="List Price"  />
        <asp:BoundField DataField="Price1" HeaderText="Retail Price"  />
    
    </Columns>
</asp:GridView>


      <asp:Button ID="btnGetSelected" runat="server" Text="Update Featured Listing" class="btn btn-secondary" style="margin-top:15px !important;"  OnClick="GetSelectedRecords" />

         
            
     </div>
                        </div>
                     </div>



            </div>
        </div>
    </main>


    
     
</asp:Content>

