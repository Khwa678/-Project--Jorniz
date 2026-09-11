<%@ Page Title="" Language="C#" MasterPageFile="~/Doctors-Dashboard/MasterPage.master" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="Doctors_Dashboard_Default" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
  
    <asp:ScriptManager ID="ScriptManager1" runat="server"></asp:ScriptManager>
   
    <main style="margin-top:70px !important;padding-top:25px !important;">
        <div class="container-fluid">
            <div class="row ">
                <div class="col-12">
                    <h1 style="margin-bottom:0px !important;padding-bottom:0px !important;font-size:19px !important;">Welcome Back! <b><asp:Label ID="Label10" runat="server"></asp:Label></b></h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block" style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-0" style="margin-bottom:0rem !important;">
                            <li class="breadcrumb-item active">
                                <b>Healthy Universe</b>
                            </li>
                            <li class="breadcrumb-item">
                                <a href="#">Doctor Dashboard</a>
                            </li>
                        </ol>
                    </nav>
                    
                </div>
            </div>
             <hr style="margin-top: 0.5rem !important;margin-bottom: 1.5rem !important;" />
              <hr style="margin-top: 0.5rem !important;margin-bottom: 1.5rem !important;" />
             <div class="row" style="margin-top:20px !important;">
                   <div class="col-md-12 col-lg-6 col-xl-4 mb-4">
                    <div class="card dashboard-progress" style="height:auto !important;">
                 
                        <div class="card-body">
                            <h5 class="card-title" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:1rem !important;">A. Quick Statistics</h5>
          
                             <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="Appointments.aspx" style="font-weight:bold !important;color:black !important;" >Pending Appointment</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label8" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                                    <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="Complete-Appoinments.aspx" style="font-weight:bold !important;color:darkslateblue !important;" >Complete Meetings</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label2" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                            
                           <div class="mb-4" style="margin-bottom: 0rem !important;">
                                <p class="mb-2"><a href="Rejected.aspx" style="font-weight:bold !important;color:darkslateblue !important;" >Rejected Meetings</a>
                                    <span class="float-right text-muted"><asp:Label ID="Label5" runat="server" style="color:#00365a !important;font-weight:bold !important;" Text="0"></asp:Label></span>
                                </p>
                            </div>
                           
                            <asp:Button ID="Button1" class="btn btn-dark" style="border-radius:3px !important;padding: 0.3rem 0.8rem !important;margin-top:20px !important;background-color:green !important;border:1px solid green !important" runat="server" Text="Complete Meetings" /> <asp:Button ID="Button2" class="btn btn-dark" style="border-radius:3px !important;padding: 0.3rem 0.8rem !important;margin-top:20px !important;background-color:red !important;border:1px solid red !important" runat="server" Text="Pending Appoitments" />
                        </div>
                    </div>
                </div>
       
              <div class="col-md-12 col-lg-6 col-xl-8 mb-4">
                        <div class="card dashboard-progress">
                 
                        <div class="card-body">
                              <h5 class="card-title" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;letter-spacing:0.4px !important;">ALL NEW APPOINTMEMTS LISTS</h5>
                        <asp:Repeater ID="Repeater1" runat="server">
           <ItemTemplate>
                 
          <asp:Label ID="Label1" Text='<%# Eval("Id") %>' runat="server"></asp:Label>    
                        
          </ItemTemplate>
           </asp:Repeater>

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
                            </div>
                            </div>
                      </div>
            </div>
            </div>
     
    </main>
</asp:Content>

