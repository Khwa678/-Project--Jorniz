<%@ Page Title="" Language="C#" MasterPageFile="~/Vendor-Panel/MasterPage.master" AutoEventWireup="true" CodeFile="Manage.aspx.cs" Inherits="Vendor_Panel_Manage" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
     <script src='https://cdn.tiny.cloud/1/ov5n6bpyebameb5jarhpw01l3jckz2vckvchfd65odkus50m/tinymce/5/tinymce.min.js' referrerpolicy="origin"></script>
  
  <script>
      tinymce.init({ selector: 'textarea', width: 350 });
  </script>

    <script type="text/javascript">
        function isNumberKey(evt) {
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if (charCode > 31 && (charCode < 48 || charCode > 57))
                return false;
            return true;
        }
    </script>

       <main style="margin-top:70px !important;padding-top:25px !important;">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">

                    <h1 style="margin-bottom:10px !important;padding-bottom:0px !important;font-size:19px !important;"><b>Profile</b> Management / Member UID:HVA000<b><asp:Label ID="Label24" runat="server" style="color:#008000 !important"></asp:Label></b> </h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block"  style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-0">
                            <li class="breadcrumb-item">
                                <a href="Dashboard.aspx">Member Dashboard</a>
                            </li>
                           
                            <li class="breadcrumb-item active" aria-current="page">Manage Account</li>
                        </ol>
                    </nav>
                    <div class="separator mb-5" style="margin-bottom:1rem !important;"></div>


                </div>
            </div>

            <div class="row">

                <div class="col-8">
                    <div class="card mb-4">
                        <div class="card-body">
                             <div id="success" runat="server" style="margin-bottom:20px !important;" class="alert alert-success alert-dismissible fade show mb-0" role="alert">
                                <strong>Account information updated!</strong> The operation was successful.
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>

                             <div id="error" runat="server" style="margin-bottom:20px !important;" class="alert alert-danger alert-dismissible fade show mb-0" role="alert">
                                <strong>Update operation failed!</strong> Please try again later or contact support.
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>


                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;letter-spacing:0.4px !important;margin-bottom:6px !important;">Manage Account Information</h6>
                            <p style="margin-bottom:1.4rem !important;">Manage your account related information below.</p>

                         
                            <asp:Label ID="Label1" runat="server" style="display:none !important;"></asp:Label>
                            <asp:Label ID="Label2" runat="server" style="display:none !important;"></asp:Label>
                             <asp:Label ID="Label3" runat="server" style="display:none !important;"></asp:Label>
                            <asp:Label ID="Label4" runat="server" style="display:none !important;"></asp:Label>

                             <asp:Label ID="Label5" runat="server" style="display:none !important;"></asp:Label>
                            <asp:Label ID="Label6" runat="server" style="display:none !important;"></asp:Label>

                             <asp:Label ID="Label7" runat="server" style="display:none !important;"></asp:Label>
                            <asp:Label ID="Label8" runat="server" style="display:none !important;"></asp:Label>

                             <asp:Label ID="Label9" runat="server" style="display:none !important;"></asp:Label>
                            <asp:Label ID="Label10" runat="server" style="display:none !important;"></asp:Label>

                             <asp:Label ID="Label11" runat="server" style="display:none !important;"></asp:Label>
                            <asp:Label ID="Label12" runat="server" style="display:none !important;"></asp:Label>

                         <%--    <asp:Label ID="Label13" runat="server" style="display:none !important;"></asp:Label>
                            <asp:Label ID="Label14" runat="server" style="display:none !important;"></asp:Label>
                            
                             <asp:Label ID="Label15" runat="server" style="display:none !important;"></asp:Label>
                            <asp:Label ID="Label16" runat="server" style="display:none !important;"></asp:Label>

                             <asp:Label ID="Label17" runat="server" style="display:none !important;"></asp:Label>
                            <asp:Label ID="Label18" runat="server" style="display:none !important;"></asp:Label>
                              <asp:Label ID="Label19" runat="server" style="display:none !important;"></asp:Label>
                            <asp:Label ID="Label20" runat="server" style="display:none !important;"></asp:Label>

                             <asp:Label ID="Label21" runat="server" style="display:none !important;"></asp:Label>
                            <asp:Label ID="Label22" runat="server" style="display:none !important;"></asp:Label>
                              <asp:Label ID="Label23" runat="server" style="display:none !important;"></asp:Label>--%>



                          
                                <div class="form-row">
                                     <div class="col-md-6 mb-3">
                                        <label for="validationTooltip003" style="width:100% !important;font-weight:600 !important;">Full Name <asp:RequiredFieldValidator ID="RequiredFieldValidator1" runat="server" ControlToValidate="TextBox1" ValidationGroup="profile" style="color:red !important;" Text="*"></asp:RequiredFieldValidator></label>
                                     <asp:TextBox ID="TextBox1" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" OnTextChanged="TextBox1_TextChanged" AutoPostBack="false" ReadOnly="true"  runat="server"></asp:TextBox>
                                    </div>
                                
                                        <div class="col-md-6 mb-3">
                                        <label for="validationTooltip003" style="width:100% !important;font-weight:600 !important;">Email Address <asp:RequiredFieldValidator ID="RequiredFieldValidator2" runat="server" ControlToValidate="TextBox2" ValidationGroup="profile" style="color:red !important;" Text="*"></asp:RequiredFieldValidator></label>
                                     <asp:TextBox ID="TextBox2" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" OnTextChanged="TextBox2_TextChanged" AutoPostBack="false" Textmode="Email"  runat="server"></asp:TextBox>
                                    </div>
                                    </div> 
                                  <div class="form-row">
                                    <div class="col-md-6 mb-3">
                                        <label for="validationTooltip003" style="width:100% !important;font-weight:600 !important;">Contact No <asp:RequiredFieldValidator ID="RequiredFieldValidator3" runat="server" ControlToValidate="TextBox3" ValidationGroup="profile" style="color:red !important;" Text="*"></asp:RequiredFieldValidator></label>
                                     <asp:TextBox ID="TextBox3" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" OnTextChanged="TextBox3_TextChanged" AutoPostBack="false" runat="server"></asp:TextBox>
                                    </div>

                                   
                                     <div class="col-md-6 mb-3">
                                        <label for="validationTooltip003" style="width:100% !important;font-weight:600 !important;">Business Name <asp:RequiredFieldValidator ID="RequiredFieldValidator4" runat="server" ControlToValidate="TextBox4" ValidationGroup="profile" style="color:red !important;" Text="*"></asp:RequiredFieldValidator></label>
                                     <asp:TextBox ID="TextBox4" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" OnTextChanged="TextBox4_TextChanged" AutoPostBack="false" runat="server"></asp:TextBox>
                                    </div>
                                     <div class="col-md-6 mb-3">
                                        <label for="validationTooltip003" style="width:100% !important;font-weight:600 !important;">Description <asp:RequiredFieldValidator ID="RequiredFieldValidator5" runat="server" ControlToValidate="TextBox5" ValidationGroup="profile" style="color:red !important;" Text="*"></asp:RequiredFieldValidator></label>
                                     <asp:TextBox ID="TextBox5" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" OnTextChanged="TextBox5_TextChanged" onkeypress="return isNumberKey(event)" AutoPostBack="false" runat="server"></asp:TextBox>
                                    </div>
                                               <div class="col-md-6 mb-3">
                                        <label for="validationTooltip003" style="width:100% !important;font-weight:600 !important;">Address</label>
                                     <asp:TextBox ID="TextBox6" class="form-control" MaxLength="12" style="color:darkslateblue !important;background-color:#fafafa !important;" OnTextChanged="TextBox6_TextChanged" AutoPostBack="false" runat="server"></asp:TextBox>
                                    </div>
                                           <div class="col-md-6 mb-3">
                                        <label for="validationTooltip003" style="width:100% !important;font-weight:600 !important;">City</label>
                                     <asp:TextBox ID="TextBox7" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" OnTextChanged="TextBox7_TextChanged" AutoPostBack="false"  runat="server"></asp:TextBox>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="validationTooltip003" style="width:100% !important;font-weight:600 !important;">State</label>
                                     <asp:TextBox ID="TextBox8" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;"  placeholder="Write here.." OnTextChanged="TextBox8_TextChanged"  AutoPostBack="false"  runat="server"></asp:TextBox>
                                    </div>
                                   <%-- <div class="col-md-6 mb-3">
                                        <label for="validationTooltip003" style="width:100% !important;font-weight:600 !important;">Gender</label>
                                     <asp:TextBox ID="TextBox7" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" OnTextChanged="TextBox7_TextChanged" AutoPostBack="false" runat="server"></asp:TextBox>
                                    </div>--%>

                                    <div class="col-md-6 mb-3">
                                        <label for="validationTooltip003" style="width:100% !important;font-weight:600 !important;">GSTIN [Optional]</label>
                                     <asp:TextBox ID="TextBox9" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" OnTextChanged="TextBox9_TextChanged" AutoPostBack="false"  runat="server"></asp:TextBox>
                                    </div>
                                    
                                    <div class="col-md-6 mb-3">
                                        <label for="valida=ionTooltip003" style="width:100% !important;font-weight:600 !important;">Panno [Optional]</label>
                                     <asp:TextBox ID="TextBox10" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" OnTextChanged="TextBox10_TextChanged" AutoPostBack="false"  runat="server"></asp:TextBox>
                                    </div>
                                 
                                    

                                    <div class="col-md-6 mb-3">
                                        <label for="validationTooltip003" style="width:100% !important;font-weight:600 !important;">Password</label>
                                     <asp:TextBox ID="TextBox12" class="form-control" style="color:darkslateblue !important;background-color:#fafafa !important;" OnTextChanged="TextBox10_TextChanged" AutoPostBack="false"  runat="server"></asp:TextBox>
                                    </div>
                                   <br/>
                            
                            </div> 
                            

                                <asp:Button ID="Button1" runat="server" class="btn btn-secondary" OnClick="Button1_Click" style="float:right !important;border-radius:3px !important;" Text="Update Account Information" ValidationGroup="profile" />
                        </div>
                    </div>


                </div>
            </div>
        </div>
    </main>
</asp:Content>

