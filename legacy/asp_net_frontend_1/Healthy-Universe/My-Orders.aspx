<%@ Page Title="Order History | Healthy Universe" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="My-Orders.aspx.cs" Inherits="My_Orders" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    
     <main id="content" role="main" class="cart-page">
         <div class="container">

              <div class="py-2" style="margin-bottom:0px !important;margin-top: 10px !important;">
                <div class="container" style="padding-left:0px !important;">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0"><a href="Default.aspx" class="font-weight-bold text-gray-90">Home</a> - Manage Your Orders</div>
                      
                    </div>
                </div>
              </div>
               <hr style="
    margin-top: 0.2rem !important;
" />
             <div class="row">
                  
                    <div class="col-md-12 mb-4 mb-md-0">
                        <div class="card mb-3 border-0 text-left rounded-0">
                            <div class="card-body" style="padding-left:0px !important;padding-top:0px !important;">

                                 
                                <h5 class="font-size-18 font-weight-semi-bold mb-3" style="color:#FFDF2B !important;    font-size: 22px !important;
    line-height: 20px !important;margin-bottom:0.5rem !important;"><span style="color:black !important;">Your Order History</span></h5>
                                <p style="margin-bottom: 1.5rem !important;max-width:100% !important;" class="text-gray-90 max-width-334 mx-auto">The following table Provides quick information for your orders.</p>
                              


 <asp:Repeater ID="rptCustomers" runat="server" OnItemDataBound="OnItemDataBound">
    <ItemTemplate>

<asp:Label ID="Label7" runat="server" Text='<%# Eval("Id") %>' style="display:none !important;"></asp:Label>
<asp:Label ID="Label8" runat="server" Text='<%# Eval("Paymentstatus") %>' style="display:none !important;"></asp:Label>

         <div style="border:solid #f2f2f2 thin !important;margin-bottom:10px !important;background-color:white !important;">
        <div style="padding:10px !important;">
       <p style="margin-bottom:10px !important;font-size:15px !important;border-bottom:solid #f2f2f2 thin !important;padding:7px !important;background-color:#FFDF2B !important;color:black !important;"><b>#<asp:Label ID="Label2" runat="server" Text='<%# Eval("Orderid") %>' /></b> / <asp:Label ID="Label6" runat="server" Text='<%# Eval("Paymenttype") %>' /> / <asp:Label ID="Label1" runat="server" Text='<%# Eval("Nettotal") %>' /> INR (<asp:Label ID="Label5" runat="server" Text='<%# Eval("Paymentstatus") %>' />)
    
          </p>
                    <asp:Repeater ID="rptOrders" runat="server">
                       
                        <ItemTemplate>
                         <p style="padding-left:20px !important;margin-bottom:10px !important;">
                       <b>OPS<asp:Label ID="Label9" runat="server" Text='<%# Eval("Payment") %>' /></b>  <asp:Label ID="lblOrderId" runat="server" Text='<%# Eval("Cname") %>' /> <asp:Label ID="Label4" runat="server" Text='<%# Eval("Csid") %>' /> / <b>Unit Price</b>: <asp:Label ID="lblOrderDate" runat="server" Text='<%# Eval("Ctotal") %>' /> INR / <b>Quantity</b>: <asp:Label ID="Label3" runat="server" Text='<%# Eval("Quantity") %>' />
                              </p>
                        </ItemTemplate>
                    </asp:Repeater>
                <asp:HiddenField ID="hfCustomerId" runat="server" Value='<%# Eval("Orderid") %>' />
            <asp:Button ID="Buttoncontrol" Text="Cancel Order" runat="server" OnClick="GetValue" />
             <p id="deliveryinfo" runat="server"><b>AWB No:</b> <asp:Label ID="Label21" runat="server" Text='<%# Eval("Awbno") %>'></asp:Label> [Delivery Partner: <a target="_blank" href="https://www.delhivery.com/">DELHIVERY</a>]</p>

                   <span style="float:right !important;margin-top:-15px !important;"><asp:Label ID="Label2x" runat="server" style="font-size:12px !important;font-weight:bold !important;margin-right:15px !important;" Text='<%# Eval("Dated") %>' /></span>
           </div>
             </div>

    </ItemTemplate>
</asp:Repeater>
                                  <div id="emptylist" style="width:100% !important" runat="server">
                                                    <div style="width:70% !important;margin:auto !important;padding:20px !important;border:solid #f2f2f2 thin !important;margin-top:20px !important;">
                                                        <table style="width:100% !important">
                                                            <tr>
                                                                <td style="padding:0px !important;width:40% !important;text-align:center !important;">
<img style="width:70% !important;height:auto !important;margin:auto !important" src="Images/noimage.png" />
                                                                </td>
                                                                <td style="padding:0px !important;width:60% !important">
<h2 style="padding-top:30px;font-size:22px !important;font-weight:bold !important;">No Previous Orders Found!</h2>
                          <p>There is nothing important which requires your attention here right now.</p>
                          
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

