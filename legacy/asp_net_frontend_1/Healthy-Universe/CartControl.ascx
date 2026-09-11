<%@ Control Language="C#" AutoEventWireup="true" CodeFile="CartControl.ascx.cs" Inherits="CartControl" %>

    <main id="content" role="main" class="cart-page">
            <!-- breadcrumb -->
            
            <!-- End breadcrumb -->
            <div class="container">

                  <div class="py-2" style="margin-bottom:0px !important;margin-top: 10px !important;">
                <div class="container" style="padding-left:0px !important;">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0"><a href="Default.aspx" >Home</a> - <a href="Search.aspx">Explore Shop</a> - Your Shopping Cart</div>
                      
                    </div>
                </div>
              </div>
                  <hr style="
    margin-top: 0.2rem !important;
" />
<asp:Label ID="Label1" runat="server" style="display:none !important"></asp:Label>
            
                <asp:GridView ID="grdCart" Width="100%" runat="server" AutoGenerateColumns="False" GridLines="None" 
    OnRowDeleting="grdCart_RowDeleting" DataKeyNames="ProductID">
    <Columns>
         <asp:TemplateField HeaderText="">
            <ItemTemplate>
                <table style="width:100% !important;border:solid #f2f2f2 2px !important;margin-bottom:15px !important;background-color:#fafafa !important;">
              <tr style="margin-bottom:6px !important;">
             <td style="padding:5px !important;width:70px !important;">
                            <asp:Image ID="Image1" style="width:70px !important;height:auto !important;max-width:70px !important;padding:0px !important;" runat="server" ImageUrl='<%# Eval("ImageUrl") %>' />
             </td>
             <td style="padding-left:20px !important;width:auto !important;padding:5px !important;padding-right:10px !important;"> 
                           
      
                
            
                <p style="display:none !important"><asp:Label ID="Label333" runat="server" Text='<%# Eval("Price") %>'></asp:Label></p>
                <p  style="display:none !important"><asp:Label ID="Label66" Text='<%# Eval("ProductName") %>' runat="server" ></asp:Label></p>
                <p style="display:none !important"><asp:Label ID="Label6" runat="server" Text='<%# Eval("ProductID") %>'></asp:Label></p>
                
      
        <p style="margin-bottom:0.5rem !important;color:black !important;margin-top:5px !important;"><asp:Label style="color:black !important;font-weight:bold !important;" Text='<%# Eval("ProductName") %>' ID="Label3" runat="server"></asp:Label> | <asp:Label style="color:black !important;" Text='<%# Eval("Delivery") %>' ID="Label2" runat="server"></asp:Label> Delivery <asp:Label ID="Label4" style="display:none !important;" runat="server" Text='<%# Eval("ProductID") %>'></asp:Label></p> 
       
        <b style="display:none !important;"><asp:Label ID="Label8" runat="server" Text='<%# Eval("Price") %>'></asp:Label></b>
    <asp:UpdatePanel ID="upnlBtnAdd" runat="server">
       <ContentTemplate>
       <table style="width:100% !important">
            <tr>
                <td style="width:20px !important;">
           <asp:LinkButton ID="Btn1" runat="server" OnClick="Btn1_Click" style="border-radius:0% !important;height: 1.5rem !important;line-height: 1.5rem !important;border:none !important;color:black !important;"> - </asp:LinkButton>
                    </td>
                <td style="width:40px !important;">
           <asp:TextBox style="max-width:30px !important;color:black !important;height: 1.5rem !important;line-height: 1.5rem !important;background-color:#fafafa !important;border-radius:0px !important;padding:0px !important;padding-left:10px !important;" enabled="false" ID="TextBox1" runat="server" Text='<%# Eval("Quantity") %>'></asp:TextBox>
           </td>
                <td style="width:10px !important;">
           <asp:LinkButton ID="Btn2" runat="server" OnClick="Btn2_Click" style="border-radius:0% !important;height: 1.5rem !important;line-height: 1.5rem !important;border:none !important;color:black !important;"> + </asp:LinkButton>
                    </td>
                <td>
            <p style="margin-bottom:0rem !important;"><b style="float:right !important;color:black !important">₹ <asp:Label ID="Label11" style="color:black !important;" runat="server" Text='<%# Eval("SubTotal") %>'></asp:Label></b> </p>  
           </td>
                    </tr>
         </table>
       </ContentTemplate>
    </asp:UpdatePanel>     
                  <asp:LinkButton ID="lbDelete" runat="server" style="float:right !important;cursor:pointer !important;padding:0px !important;background-color:white !important;color:black !important;text-decoration:underline !important;border:none !important;font-size:13px !important;height: 1.5rem !important;" CommandArgument='<%# Eval("ProductID") %>' CausesValidation="False"
                    CommandName="Delete" Text="Remove"
                    OnClientClick="confirm('You are about to remove this product. \n\Do you wish to proceed?');"></asp:LinkButton>      
      

             </td> 
                     </tr>
                   </table>
          </ItemTemplate>
             
        </asp:TemplateField>
    </Columns>
    <EmptyDataTemplate>
<div style="width:100% !important;height:auto !important;text-align:center !important;">
    
<a href="Search.aspx"> <img style="width:100% !important;max-width:500px !important;height:auto !important;margin:auto !important;margin-bottom:20px !important;" src="Images/empty-cart.png" /></a>
    <p><b>Your Shopping Cart is Empty!</b><br/>Looks like you haven't selected any products yet.</p>
    <a style="border: none;
    background-color: #7FB841;
    outline: none;
    cursor: pointer;
    display: inline-block;
    text-decoration: none;
    padding: 8px 25px;
    color: #fff;
    font-weight: 500;
    text-align: center;
    font-size: 0.875rem;margin-bottom:30px !important;font-weight:bold !important;" href="Search.aspx">Explore Our Products</a>
   
</div>
    </EmptyDataTemplate>
</asp:GridView>
                
                         
               <div class="row" id="ordercontinue" style="width:100% !important;margin-bottom:25px !important;margin-left:0px !important;margin-right:0px !important;" runat="server">
        
      <asp:UpdatePanel ID="upnlBtnAdd1" runat="server" style="width:100% !important;">
    <ContentTemplate>
     <p style="float:left !important;padding-left:0px !important;font-size:17px !important;margin-bottom:1rem !important;"><b>Your Total</b>: <span style="color:black !important;">₹ <asp:Label style="color:black !important;" ID="TotalLabel" runat="server"></asp:Label>.00</span></p>  
    </ContentTemplate>
       </asp:UpdatePanel>
                  
     <asp:LinkButton ID="Button1" CausesValidation="false" style="border: none;
    background-color: white;
    outline: none;
    cursor: pointer;
    display: inline-block;
    text-decoration: none;
    padding: 8px 25px;
    color: black;
    font-weight: bold;
    text-align: center;
    font-size: 0.875rem;border:solid black thin !important;" OnClick="Button1_Click" runat="server" Text="Proceed To Checkout"></asp:LinkButton> 
       
    
                  
                    </div>  

                </div>
        </main>
       
     
