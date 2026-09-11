<%@ Page Title="Thank You For Your Order | Healthy Universe" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Order.aspx.cs" Inherits="Order" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
     <main id="content" role="main">
         <div class="container">

              <div class="py-2" style="margin-bottom: 0px !important;margin-top: 10px !important;">
                <div class="container" style="padding-left:0px !important;">
                    <div class="d-block d-md-flex">
                        <div class="mb-3 mb-md-0" style="margin-bottom:0rem !important;"><a href="Default.aspx" class="font-weight-bold text-gray-90">Home</a> - Order Received</div>
                    </div>
                </div>
              </div>
              <hr style="
    margin-top: 0.2rem !important;
" />
             <div class="row">
                    <div class="col-md-3 mb-4 mb-md-0">
                        <div class="card mb-3 border-0 text-center rounded-0">
                          <img style="width:100% !important;height:auto !important;margin:auto !important;padding:0% 10% !important;" src="Images/order-placed.png" />
                        </div>
                    </div>
                    <div class="col-md-9 mb-4 mb-md-0">
                        <div class="card mb-3 border-0 text-left rounded-0">
                            <div class="card-body">
                   
                                <h3 style="font-size:24px !important;margin-top:10px !important; font-weight:bold !important;">Order Placed Successfully.</h3>
								<p>Sit back and relax while we deliver your products. Our delivery team will start processing your order soon. We will provide regular updates regarding your order on your registered contact information. You can also keep track of your order in your orders window.<br/><br/><b>Please Note</b>: We are strictly following COVID-19 prevention measures.<br/><span style="font-style:italic !important;">Please bear with us in case of any unexpected delays due to the same.</span></p>
														<p><b>Order ID</b>: <asp:Label ID="Label3" runat="server" Text="Label"></asp:Label> | <b>Transaction ID</b>: <asp:Label ID="Label1" runat="server" Text="Label"></asp:Label> | <b>Bill Total</b>: <asp:Label ID="Label2" runat="server" Text="Label"></asp:Label> INR | <b>Payment Status</b>: Cash On Delivery</p>
                                
                                <asp:Button ID="Button5"  OnClick="Button5_Click" CssClass="btn btn-dark" style="border-radius:0px !important;" runat="server" Text="My Dashboard"></asp:Button>
                            <asp:Button ID="Button6" OnClick="Button6_Click" runat="server" CssClass="btn btn-primary" style="border-radius:0px !important;color:white !important;" Text="View Your Orders"></asp:Button>

                                 <div style="display:none !important;">
               <asp:Repeater ID="grdCart" runat="server">
                       
                        <ItemTemplate>
                         <p style="padding-left:20px !important;background-color:white !important;margin-bottom:4px !important;padding:4px 10px !important;border:solid #fafafa thin !important;">
                             <b><asp:Label ID="lblOrderId" runat="server" Text='<%# Eval("Cname") %>' /></b>:  x  <asp:Label ID="Label3" runat="server" Text='<%# Eval("Quantity") %>' />
                         </p>
                        </ItemTemplate>
                    </asp:Repeater>
              </div>


                            </div>
                        </div>
                    </div>
                </div>

             
               
            </div>
         </main>
</asp:Content>

