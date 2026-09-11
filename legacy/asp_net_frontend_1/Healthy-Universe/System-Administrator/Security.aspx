<%@ Page Title="" Language="C#" MasterPageFile="~/System-Administrator/MasterPage.master" AutoEventWireup="true" CodeFile="Security.aspx.cs" Inherits="System_Administrator_Security" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <main style="margin-top: 85px !important;">
        <div class="container-fluid">
            <div class="row  ">
                <div class="col-12">
                    <h1 style="margin-bottom:0px !important;padding-bottom:0px !important;font-size:17px !important;"><b>System Access</b> Management</h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block" style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-0" style="margin-bottom:0rem !important;padding:0px !important;">
                            <li class="breadcrumb-item active">
                                <b>Dashboard</b>
                            </li>
                            <li class="breadcrumb-item">
                                <a href="#">System Security</a>
                            </li>
                        </ol>
                    </nav>
                    
                </div>
                  
                
            </div>
              <hr style="margin-top: 0.5rem !important;margin-bottom: 1rem !important;" />
             <div class="row" style="margin-top:20px !important;">

                <div class="col-md-9 col-lg-9 col-xl-9 mb-4">




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


                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:4px !important;">Update Master Credentials</h6>
                            <p style="margin-bottom:1.4rem !important;">Update your access credentials below. Changes take effect on fresh login.</p>

                         
                            <asp:Label ID="Label3" runat="server" style="display:none !important;"></asp:Label>
                            <asp:Label ID="Label4" runat="server" style="display:none !important;"></asp:Label>
                           

                            <div class="needs-validation mb-5">
                                
                                <div class="form-row">
                                    <div class="col-md-12 mb-3">
                                        <label for="validationTooltipUsername2" style="width:100% !important;">Registered Email Address <asp:RequiredFieldValidator ID="RequiredFieldValidator2" runat="server" ControlToValidate="TextBox3" ValidationGroup="profile" style="color:red !important;" Text="*"></asp:RequiredFieldValidator></label>
                                        <div class="input-group">
                                            <div class="input-group-prepend">
                                                <span class="input-group-text" id="validationTooltipUsernamePrepend">@</span>
                                            </div>
                                        <asp:TextBox ID="TextBox3" class="form-control" style="color:darkslateblue !important;" TextMode="Email" OnTextChanged="TextBox3_TextChanged" AutoPostBack="false" runat="server"></asp:TextBox>
                                        </div>
                                    </div>
                                      
                                    <div class="col-md-12 mb-3">
                                        <label for="validationTooltip003" style="width:100% !important;">Password <asp:RequiredFieldValidator ID="RequiredFieldValidator3" runat="server" ControlToValidate="TextBox4" ValidationGroup="profile" style="color:red !important;" Text="*"></asp:RequiredFieldValidator></label>
                                     <asp:TextBox ID="TextBox4" class="form-control" style="color:darkslateblue !important;" OnTextChanged="TextBox4_TextChanged" AutoPostBack="false" runat="server"></asp:TextBox>
                                    </div>
                                   

                                </div>
                                <asp:Button ID="Button1" runat="server" class="btn btn-secondary" OnClick="Button1_Click" style="float:right !important;border-radius:3px !important;" Text="Update Information" ValidationGroup="profile" />
                            </div>


                          
                        </div>
                    </div>


                </div>

                  <div class="col-md-3 col-lg-3 col-xl-3 mb-4">
                      <img style="width:100% !important;height:auto !important;margin:auto !important;" src="Images/lock.png" />
                   </div>

            </div>
        </div>
    </main>
</asp:Content>

