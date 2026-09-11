<%@ Page Title="" Language="C#" MasterPageFile="~/System-Administrator/MasterPage.master" AutoEventWireup="true" CodeFile="Dashboard.aspx.cs" Inherits="System_Administrator_Dashboard" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
  
    <main style="margin-top: 95px !important;">
        <div class="container-fluid">
            <div class="row  ">
                <div class="col-12">
                    <h1 style="margin-bottom:0px !important;padding-bottom:0px !important;font-size:17px !important;">Welcome Back! <b>Cloud Administrator</b></h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block" style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-0" style="margin-bottom:0rem !important;padding:0px !important;">
                            <li class="breadcrumb-item active">
                                <b>Healthy Universe</b>
                            </li>
                            <li class="breadcrumb-item">
                                <a href="#">Management Dashboard</a>
                            </li>
                        </ol>
                    </nav>
                    
                </div>
                  
                
            </div>
            <hr style="margin-top: 0.5rem !important;margin-bottom: 1.5rem !important;" />
             <div class="row" style="margin-top:20px !important;">
                   <div class="col-md-12 col-lg-6 col-xl-3 mb-4">
                    <div class="card dashboard-progress" style="height:auto !important;">
                 
                        <div class="card-body">
                            <h5 class="card-title" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:1rem !important;">A. Quick Statistics</h5>
          
                             <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="Departments.aspx" style="font-weight:bold !important;color:black !important;" >Departments</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label8" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                             <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="Categories.aspx" style="font-weight:bold !important;color:black !important;" >Categories</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label9" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                            <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="Sub-Category.aspx" style="font-weight:bold !important;color:black !important;" >Sub-Categories</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label11" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                            
                           <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="#" style="font-weight:bold !important;color:darkslateblue !important;" >All Orders</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label5" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                             <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="#" style="font-weight:bold !important;color:darkslateblue !important;" >Registered Customers</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label7" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                             
                        </div>
                    </div>
                </div>
            <div class="col-md-12 col-lg-6 col-xl-3 mb-4">
                    <div class="card dashboard-progress" style="height:auto !important;">                       
                        <div class="card-body">
                              <h5 class="card-title" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:1rem !important;">B. Featured Services</h5>
                            <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="New-Registration.aspx" style="font-weight:bold !important;color:black !important;" >Pending Approval</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label13" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                             <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="Inactive-Tests.aspx" style="font-weight:bold !important;color:black !important;" >Pending Tests Requests</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label12" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                            <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="Services.aspx" style="font-weight:bold !important;color:black !important;" >Services</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label10" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                             <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="Service-Provider.aspx" style="font-weight:bold !important;color:black !important;" >Service Providers</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label3" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                             <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="Doctors.aspx" style="font-weight:bold !important;color:black !important;" >Onboard Doctors</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label4" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                             <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="Products.aspx" style="font-weight:bold !important;color:black !important;" >Listed Products</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label6" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                           
                           
                            
                        </div>
                    </div>
                </div>
                  <div class="col-md-12 col-lg-6 col-xl-3 mb-4">
                    <div class="card dashboard-progress" style="height:auto !important;">
                 
                        <div class="card-body">
                            <h5 class="card-title" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:1rem !important;">C. Appointments</h5>
                            <div class="mb-4" style="margin-bottom: 0.5rem !important;">
                                <p class="mb-2"><a style="font-weight:bold !important;color:darkslateblue !important;" href="#">All Appointments</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label2" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                            <p>Appointments can be made by the customer, agent or administrator.</p>
                            <asp:Button ID="Button1" class="btn btn-dark" style="border-radius:3px !important;padding: 0.3rem 0.8rem !important;" runat="server" Text="Create" /> <asp:Button ID="Button2" class="btn btn-dark" style="border-radius:3px !important;padding: 0.3rem 0.8rem !important;" runat="server" Text="Manage" />
                        </div>
                    </div>
                </div>
                 <div class="col-md-12 col-lg-6 col-xl-3 mb-4">
                    <div class="card dashboard-progress" style="height:auto !important;">
                 
                        <div class="card-body">
                            <h5 class="card-title" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:1rem !important;">D. Meetings</h5>
                               <div class="mb-4" style="margin-bottom: 0.5rem !important;">
                                <p class="mb-2"><a style="font-weight:bold !important;color:darkslateblue !important;" href="#">All Meetings</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label1" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                            <p>Meetings can be booked by the customer, agent or administrator.</p>
                              <asp:Button ID="Button3" class="btn btn-dark" style="border-radius:3px !important;padding: 0.3rem 0.8rem !important;" runat="server" Text="Create" /> <asp:Button ID="Button4" class="btn btn-dark" style="border-radius:3px !important;padding: 0.3rem 0.8rem !important;" runat="server" Text="Manage" />
                        </div>
                    </div>
                </div>
                  <div class="col-md-12 col-lg-12 col-xl-12 mb-4">
                    <div class="card dashboard-progress" style="height:auto !important;">
                 
                        <div class="card-body" style="padding-top:0.75rem !important;padding-bottom:0.75rem !important;background-color:#fafafa !important;">
                            <h5 class="card-title" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:0.5rem !important;">Technical Annonations</h5>
                             
                            <div class="row">

            <div class="col-md-4 col-lg-4 col-xl-4">
                <p style="margin-bottom:0rem !important;"><span style="float:right !important;width:10px !important;height:10px !important;background-color:green !important;margin-right:12px !important;border-radius:50% !important;margin-top:5px !important;"></span> Feature is Ready To Use</p>
                </div>
                                <div class="col-md-4 col-lg-4 col-xl-4">
                                    <p style="margin-bottom:0rem !important;"><span style="float:right !important;width:10px !important;height:10px !important;background-color:cornflowerblue !important;margin-right:12px !important;border-radius:50% !important;margin-top:5px !important;"></span> Feature is Under Test & Deployment</p>
                </div>
                                <div class="col-md-4 col-lg-4 col-xl-4">
                                    <p style="margin-bottom:0rem !important;"><span style="float:right !important;width:10px !important;height:10px !important;background-color:red !important;margin-right:12px !important;border-radius:50% !important;margin-top:5px !important;"></span> Feature is Under Correction Or Completion</p>
                </div>
                                </div>

                        </div>
                    </div>
                </div>
                 </div>
          
            
            </div>
    </main>
   
</asp:Content>

