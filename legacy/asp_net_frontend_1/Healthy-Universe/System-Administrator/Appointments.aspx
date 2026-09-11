<%@ Page Title="" Language="C#" MasterPageFile="~/System-Administrator/MasterPage.master" AutoEventWireup="true" CodeFile="Appointments.aspx.cs" Inherits="System_Administrator_Appointments" %>

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

