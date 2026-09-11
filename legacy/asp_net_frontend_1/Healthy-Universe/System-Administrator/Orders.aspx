<%@ Page Title="" Language="C#" MasterPageFile="~/System-Administrator/MasterPage.master" AutoEventWireup="true" CodeFile="Orders.aspx.cs" Inherits="System_Administrator_Orders" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    

       <main>
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">

                    <h1 style="margin-bottom:15px !important;padding-bottom:0px !important;font-size:21px !important;font-weight:bold !important;">Order History</h1>
                    <nav class="breadcrumb-container d-none d-sm-block d-lg-inline-block"  style="float:right !important;margin-top:0px !important;" aria-label="breadcrumb">
                        <ol class="breadcrumb pt-0">
                            <li class="breadcrumb-item">
                                <a href="Dashboard.aspx">Dashboard</a>
                            </li>
                           
                            <li class="breadcrumb-item active" aria-current="page">All Active Orders</li>
                        </ol>
                    </nav>
                    <div class="separator mb-5"></div>


                </div>
            </div>

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
                          

                            <h6 class="mb-3" style="font-weight:bold !important;text-transform:uppercase !important;font-size:15px !important;letter-spacing:0.4px !important;margin-bottom:6px !important;">Review Your Orders</h6>
                            <p style="margin-bottom:1.4rem !important;">Following data helps in reviewing your active orders.</p>

                            <asp:Label ID="Label24" runat="server" style="display:none !important"></asp:Label>
         <asp:Repeater ID="rptCustomers" runat="server" OnItemDataBound="OnItemDataBound">
    <ItemTemplate>
<asp:Label ID="Label17" runat="server" Text='<%# Eval("Id") %>' style="display:none !important;"></asp:Label>
<asp:Label ID="Label18" runat="server" Text='<%# Eval("Paymentstatus") %>' style="display:none !important;"></asp:Label>
        <div style="border:solid silver thin !important;background-color:white !important;margin-bottom:10px !important;">
        <div style="padding:10px !important;">
       <p style="background-color:green !important;color:white !important;padding:5px !important;margin-bottom:10px !important;">#<asp:Label ID="Label7" runat="server" Text='<%# Eval("Orderid") %>' /> / <asp:Label ID="Label6" runat="server" Text='<%# Eval("Paymenttype") %>' /> / Payment Status: <asp:Label ID="Label5" runat="server" Text='<%# Eval("Paymentstatus") %>' /> / <b><asp:Label ID="Label1" runat="server" Text='<%# Eval("Nettotal") %>' /> INR</b> | Order Date: <asp:Label ID="Label2" runat="server" Text='<%# Eval("Dated") %>' />
          </p>
                    <asp:Repeater ID="rptOrders" runat="server">
                       
                        <ItemTemplate>
                         
                         <p style="padding-left:10px !important;">
                              <b>Product</b>:  <b><asp:Label ID="Label20" style="display:none" runat="server" Text='<%# Eval("Payment") %>' /></b> <asp:Label ID="lblOrderId" runat="server" Text='<%# Eval("Cname") %>' /> <asp:Label ID="Label4" runat="server" Text='<%# Eval("Csid") %>' /> / <b>Unit Price</b>: <asp:Label ID="lblOrderDate" runat="server" Text='<%# Eval("Ctotal") %>' /> INR / <b>Quantity</b>: <asp:Label ID="Label3" runat="server" Text='<%# Eval("Quantity") %>' /> / <b>Size</b>: <asp:Label ID="Label23" runat="server" Text='<%# Eval("Sizename") %>' />
                              </p>
                        </ItemTemplate>
                    </asp:Repeater>
            <p  style="padding-left:10px !important;"><b>Customer Information:</b> <asp:Label ID="Label8" runat="server"></asp:Label> / <asp:Label ID="Label9" runat="server"></asp:Label> / <asp:Label ID="Label10" runat="server"></asp:Label>
                
                </p>
            <p  style="padding-left:10px !important;"><b>Delivery Address:</b> 
              <asp:Label ID="Label11" runat="server"></asp:Label> / <asp:Label ID="Label12" runat="server"></asp:Label> / <asp:Label ID="Label13" runat="server"></asp:Label> / <asp:Label ID="Label14" runat="server"></asp:Label> /  <asp:Label ID="Label19" runat="server"></asp:Label> / <asp:Label ID="Label15" runat="server"></asp:Label> / <asp:Label ID="Label22" runat="server"></asp:Label>
                </p>
               <asp:Label ID="Label16" runat="server" Text='<%# Eval("Id") %>' style="display:none !important;"></asp:Label>
                <asp:HiddenField ID="hfCustomerId" runat="server" Value='<%# Eval("Orderid") %>' />



                 <asp:TextBox ID="TextBox1" placeholder="Enter AWB No." runat="server"></asp:TextBox> 
                 <asp:Button ID="Buttoncontrol" style="display:inline-block !important;" Text="Update Order Status" runat="server" OnClick="GetValue" />
       
         <p id="deliveryinfo" runat="server"><b>AWB No:</b> <asp:Label ID="Label21" runat="server" Text='<%# Eval("Awbno") %>'></asp:Label></p>

        </div>
             </div>

    

    </ItemTemplate>
</asp:Repeater>
        
     </div>
                        </div>
                     </div>



            </div>
        </div>
    </main>


    
     


</asp:Content>

