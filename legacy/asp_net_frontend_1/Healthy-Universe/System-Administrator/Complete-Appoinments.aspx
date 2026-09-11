<%@ Page Title="" Language="C#" MasterPageFile="~/System-Administrator/MasterPage.master" AutoEventWireup="true" CodeFile="Complete-Appoinments.aspx.cs" Inherits="System_Administrator_Complete_Appoinments" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
       <main style="margin-top: 75px !important;">
        <div class="container-fluid">
       <div class="row" style="margin-top:20px !important;">
                 
                <div class="col-md-8 col-lg-6 col-xl-12 mb-4">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;margin-bottom:6px !important;">A. Manage Listed Appointment</h6>
                            <p style="margin-bottom:1.4rem !important;">Manage all Complete Appointment listed on the network.</p>
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

