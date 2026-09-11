<%@ Page Title="" Language="C#" MasterPageFile="~/System-Administrator/MasterPage.master" AutoEventWireup="true" CodeFile="Export.aspx.cs" Inherits="System_Administrator_Export" %>

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

       <main>
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">

                    <h1 style="margin-bottom:15px !important;padding-bottom:0px !important;font-size:21px !important;font-weight:bold !important;">Your Customers</h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block"  style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-0">
                            <li class="breadcrumb-item">
                                <a href="Dashboard.aspx">Dashboard</a>
                            </li>
                           
                            <li class="breadcrumb-item active" aria-current="page">Export Data</li>
                        </ol>
                    </nav>
                    <div class="separator mb-5"></div>


                </div>
            </div>

            <div class="row">
                 <div id="failed" runat="server" style="margin-bottom:20px !important;" class="alert alert-danger alert-dismissible fade show mb-0" role="alert">
                                <strong>Operation failed!</strong> Please try again later or contact support.
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                <div class="col-md-12 col-lg-6 col-xl-4 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                           
                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;letter-spacing:0.4px !important;margin-bottom:6px !important;">Export Service Providers List</h6>
                            <p style="margin-bottom:1.4rem !important;">Export Providers data to excel for Services Providers registered on the network.</p>

                            <div class="needs-validation mb-5">
                                
                              <asp:Button ID="Button1"  class="btn btn-secondary" runat="server" OnClick="Button1_Click" Text="Export Data" />
                          
                            </div>
                          
                        </div>
                    </div>


                </div>

                 <div class="col-md-12 col-lg-6 col-xl-4 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                             <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;letter-spacing:0.4px !important;margin-bottom:6px !important;">Export Customers Data</h6>
                            <p style="margin-bottom:1.4rem !important;">Export request based data to excel for Customers Registered On the Newtwork.</p>

                            <div class="needs-validation mb-5">
                                
                              <asp:Button ID="Button2" class="btn btn-secondary" runat="server" OnClick="Button2_Click" Text="Export Data" />
                          
                            </div>
                            </div>
                        </div>
                     </div>

                
                 <div class="col-md-12 col-lg-6 col-xl-4 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                             <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;letter-spacing:0.4px !important;margin-bottom:6px !important;">Export All Products details Data</h6>
                            <p style="margin-bottom:1.4rem !important;">Export request based data to excel for All Products Details Registered On the Newtwork.</p>

                            <div class="needs-validation mb-5">
                                
                              <asp:Button ID="Button3" class="btn btn-secondary" runat="server" OnClick="Button3_Click" Text="Export Data" />
                          
                            </div>
                            </div>
                        </div>
                     </div>



            </div>
        </div>
    </main>


    
     



</asp:Content>

