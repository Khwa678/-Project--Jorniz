<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Checkout.aspx.cs" Inherits="Checkout" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">


          <main id="content" role="main">


        
       <div class="container" style="margin-top:0px !important;margin-bottom:30px !important;">
          
                <!-- Banner 2 columns -->
             <div class="mb-8"  style="margin-bottom: 0.5rem !important;padding:40px 0px !important">
                   <%--<div class="row" style="margin-bottom:15px !important;">

                                <div  class="col-md-6 mb-3 mb-md-0">
              <img style="width:100% !important;height:auto !important;margin:auto !important;" src="Images/OP1.png" />
                                    </div>
                  <div  class="col-md-6 mb-3 mb-md-0">
               <img style="width:100% !important;height:auto !important;margin:auto !important;" src="Images/OP2.png" />
                      </div>
                </div>--%>
                 <div class="container">
                     <label>Please Select Form:</label>
                 	<asp:DropDownList class="form-control" style="border-radius: 0rem !important;border:solid black 2px;" AutoPostBack="true" ID="DropDownList4" runat="server">
                                    <asp:ListItem Value="1">Product Orders</asp:ListItem>
                                   <asp:ListItem Value="0">Doctor Appoinments</asp:ListItem>
						</asp:DropDownList>
                     </div>
                    <div class="row"  style="display:none;" id="Formone" runat="server">
                       
                                <div  class="col-md-6 mb-3 mb-md-0">
                                    <div style="padding:20px !important;margin:5px !important;border:solid #f2f2f2 2px !important;">

                                             <p id="success2" runat="server" style="padding:5px !important;background-color:green !important;color:white !important;padding-left:15px !important;margin-bottom:0px !important;margin-bottom:15px !important;"><i class="fa fa-check"></i> &nbsp; <b>Nice!</b> Your Address was successfully added.</p>
                    <p id="failed" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;margin-bottom:0px !important;margin-bottom:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Some Error Occoured. Please Try Again.</p>

                                            <h3 class="section-title section-title__full mb-0 pb-2 font-size-17" style="font-weight:bold !important;margin-bottom:25px !important;margin-top:0px !important;">A. Order Related Information</h3>
<%--                     <p style="float:right !important;font-size:12px !important;margin-top: 0.5rem !important;margin-bottom: 0.2rem !important;font-weight:bold !important;">Swipe For More <i class="fa fa-arrow-alt-circle-right"></i></p>--%>

                       <div class="form-group">
                          
                           <label><b>Select Address</b></label>
						<asp:DropDownList class="form-control" style="border-radius: 0rem !important;border:solid blue 2px;" ID="DropDownList2" runat="server">
						</asp:DropDownList>
						</div>
                                        <hr/>
                                         <label><b>Add New Address</b></label>
		                 <div class="form-group">
							<label>Full Address <asp:RequiredFieldValidator ID="RequiredFieldValidator3" 
                                        ValidationGroup="support21" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox4"></asp:RequiredFieldValidator></label>
<asp:TextBox ID="TextBox4" class="form-control" style="border-radius: 0rem !important;" placeholder="Write Full address here*" runat="server"></asp:TextBox>
						</div>
						<div class="form-group">
							<label>Area / Landmark <asp:RequiredFieldValidator ID="RequiredFieldValidator5" 
                                        ValidationGroup="support21" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox5"></asp:RequiredFieldValidator></label>
						<asp:TextBox ID="TextBox5" class="form-control" style="border-radius: 0rem !important;" placeholder="ex: Opp. SBI Building / Indira Nagar" runat="server"></asp:TextBox>
						</div>
                                           <div class="form-group">
							<label>Pincode <asp:RequiredFieldValidator ID="RequiredFieldValidator9" 
                                        ValidationGroup="support21" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox10"></asp:RequiredFieldValidator><asp:RegularExpressionValidator 
                             ID="RegularExpressionValidator2" 
                                 runat="server" ControlToValidate="TextBox10" ValidationGroup="support21"
                             ErrorMessage="Exactly 6 digits." 
                                 style="font-size:13px !important;color:red !important;"
                             ValidationExpression="^\d{6}$"></asp:RegularExpressionValidator></label>
						<asp:TextBox ID="TextBox10" class="form-control" placeholder="Enter Area Code" MaxLength="6" onkeypress="return isNumberKey(event)" style="border-radius: 0rem !important;" runat="server"></asp:TextBox>
						</div>
                        <div class="form-group">
							<label>City <asp:RequiredFieldValidator ID="RequiredFieldValidator33" 
                                        ValidationGroup="support21" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox6"></asp:RequiredFieldValidator></label>
                                        <asp:TextBox ID="TextBox6" class="form-control" style="border-radius: 0rem !important;" placeholder="ex: Lucknow" runat="server"></asp:TextBox>
					
						</div>      
                        <div class="form-group">
								<label>State <asp:RequiredFieldValidator ID="RequiredFieldValidator6" 
                                        ValidationGroup="support21" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox1"></asp:RequiredFieldValidator></label>
                                        <asp:TextBox ID="TextBox1" class="form-control" style="border-radius: 0rem !important;" placeholder="ex: Uttar Pradesh" runat="server"></asp:TextBox>
					
						
						</div>
                        <div class="form-group">
							<label>Address Type</label>
						<asp:DropDownList class="form-control" style="padding:5px !important;border-radius: 0rem !important;" ID="DropDownList3" runat="server">
                             <asp:ListItem>Home</asp:ListItem>
                            <asp:ListItem>Office</asp:ListItem>
                            <asp:ListItem>Other</asp:ListItem>
						</asp:DropDownList>
						</div>

<hr/>
                   <div class="form-group">
                        <asp:Button ID="Button1" OnClick="Button1_Click" class="btn btn-light" style="display:none !important;" runat="server" Text="Save & Select Address" />
                        <asp:Button ID="Button2" OnClick="Button2_Click" ValidationGroup="support21" class="btn btn-light" style="border:solid silver thin !important;border-radius: 0rem !important;float:right !important;" runat="server" Text="Save & Select Address" />
                       <br/><br/>
					</div> 

                                   </div>  
                                </div>
                                <div  class="col-md-6 mb-3 mb-md-0">
                                    <div style="padding:20px !important;margin:5px !important;border:solid dimgrey 2px !important;">

     <p id="psuccess" runat="server" style="padding:5px !important;background-color:green !important;color:white !important;padding-left:15px !important;margin-bottom:0px !important;margin-bottom:15px !important;"><i class="fa fa-check"></i> &nbsp; <b>Great!</b> You won a discounted deal.</p>
     <p id="pfailed" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;margin-bottom:0px !important;margin-bottom:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Promo seems invalid!</p>
   <%--  <p id="offertag" runat="server" style="padding:10px !important;background-color:white !important;color:black !important;width:100% !important;border:solid silver thin !important;"><b>Early Bird Offer</b><br/>Congratulations! You are eligible for flat 100 OFF on this order. Welcome to <b> Healthy Universe</b>.</p>
  		--%>
                                            <h3 class="section-title section-title__full mb-0 pb-2 font-size-17" style="font-weight:bold !important;margin-bottom:25px !important;margin-top:0px !important;">B. Billing Related Information</h3>
<%--                     <p style="float:right !important;font-size:12px !important;margin-top: 0.5rem !important;margin-bottom: 0.2rem !important;font-weight:bold !important;">Swipe For More <i class="fa fa-arrow-alt-circle-right"></i></p>--%>


                             <div class="form-group">
					            <label style="margin-bottom:0px !important;"><b>Order Time</b>: <asp:Label ID="Label15" runat="server"></asp:Label></label>
                            </div>


                                         <asp:Label ID="Label2" runat="server" style="display:none !important;"></asp:Label>

		  <asp:Repeater ID="Repeater1" runat="server" OnItemDataBound="Repeater1_ItemDataBound">
              <ItemTemplate>

         <table style="width:100% !important;border:solid #f2f2f2 2px !important;margin-bottom:15px !important;background-color:#fafafa !important;">
              <tr style="margin-bottom:6px !important;">
             <td style="padding-left:0px !important;width:auto !important;padding:10px !important;"> 
                       
      
        <p style="margin-bottom:0rem !important;color:#5ca7db !important;">
            <asp:Label style="color:#5ca7db !important;letter-spacing:1px !important;font-weight:500 !important;font-size:12px !important;" Text='<%# Eval("Cname") %>' ID="Label3" runat="server"></asp:Label>
            <asp:Label ID="Label4" runat="server" Text='<%# Eval("Csid") %>'></asp:Label>
        </p> 
        <p style="width:100% !important;margin-bottom:0rem !important;color:black !important;">
            Qty: <asp:Label style="color:black !important;font-weight:bold !important;" Text='<%# Eval("Quantity") %>' ID="Label9" runat="server"></asp:Label> / Unit Price:        <b>₹<asp:Label ID="Label8" runat="server" Text='<%# Eval("Ctotal") %>'></asp:Label></b>  <b style="float:right !important;">₹<asp:Label ID="Label11" style="color:black !important;" runat="server"></asp:Label></b>
        </p>
          
                       
             </td> 
                     </tr>
                   </table>


              </ItemTemplate>
          </asp:Repeater>
                  <hr/>
                           <p style="margin-bottom: 0.275rem !important;">Your Total <span style="float:right !important;font-weight:bold !important;font-size:15px !important;">₹ <asp:Label ID="Label5" runat="server"></asp:Label>.00</span></p>
                          <%-- <p style="margin-bottom: 0.275rem !important;">Delivery Fee <asp:Label ID="Label13" style="font-weight:bold !important;color:blue !important;font-size:12px !important;" runat="server"></asp:Label> <span style="float:right !important;font-weight:bold !important;font-size:15px !important;">₹ <asp:Label ID="Label6" runat="server" Text="54.00"></asp:Label></span></p>
                       
                           <p style="margin-bottom: 0.275rem !important;"><span id="tag" runat="server">Discount</span><span id="tag1" runat="server" style="float:right !important;font-weight:bold !important;font-size:15px !important;">(-) ₹ <asp:Label ID="Label7" runat="server"></asp:Label></span></p>
                           
                                --%>
                              
                           <p>To Pay <span style="float:right !important;font-size:24px !important;font-weight:bold !important;margin-top:-3px !important;">₹<asp:Label ID="Label10" runat="server"></asp:Label>.00</span></p>
                     
                                 <div class="form-group">
<asp:Label ID="Label12" runat="server" style="display:none !important;"></asp:Label>
							<label>Your Contact No <asp:RequiredFieldValidator ID="RequiredFieldValidator2" 
                                        ValidationGroup="support222" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox2"></asp:RequiredFieldValidator> <asp:RegularExpressionValidator ID="RegularExpressionValidator1" ForeColor="Red"
                             runat="server" ControlToValidate="TextBox2" ValidationGroup="support222"
                             ErrorMessage="Enter a 10 digit IN number"  
                             ValidationExpression="^\d{10}$"></asp:RegularExpressionValidator></label>
                                    
                                        <asp:TextBox ID="TextBox2" MaxLength="10" OnTextChanged="TextBox2_TextChanged" AutoPostBack="false" class="form-control" style="border-radius: 0rem !important;" onkeypress="return isNumberKey(event)" placeholder="10 Digit contact no here..." runat="server"></asp:TextBox>
					
						        </div> 
                                  <div class="form-group">
<asp:Label ID="Label16" runat="server" style="display:none !important;"></asp:Label>
							<label>Contact Person <asp:RequiredFieldValidator ID="RequiredFieldValidator1" 
                                        ValidationGroup="support222" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox3"></asp:RequiredFieldValidator></label>
                                      
                                        <asp:TextBox ID="TextBox3" OnTextChanged="TextBox3_TextChanged" AutoPostBack="false" class="form-control" style="border-radius: 0rem !important;" placeholder="Your name here..." runat="server"></asp:TextBox>
						        </div>
                      <div class="form-group">
<asp:Label ID="Label17" runat="server" style="display:none !important;"></asp:Label>
							<label>Email Address <asp:RequiredFieldValidator ID="RequiredFieldValidator4" 
                                        ValidationGroup="support222" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox7"></asp:RequiredFieldValidator></label>
                                      
                                        <asp:TextBox ID="TextBox7" OnTextChanged="TextBox7_TextChanged" AutoPostBack="false"  class="form-control" style="border-radius: 0rem !important;" placeholder="Communication Email Address here..." runat="server"></asp:TextBox>
						        </div>

                               <asp:Button ID="Button3" runat="server" ValidationGroup="support222" OnClick="Button3_Click"  class="btn btn-light" style="border:solid silver thin !important;border-radius: 0rem !important;" Text="Pay Now"></asp:Button>
                               <asp:Button ID="Button4" runat="server" ValidationGroup="support222"  class="btn btn-light" style="border:solid silver thin !important;float:right !important;border-radius: 0rem !important;" OnClick="Button4_Click"  Text="Pay by Cash"></asp:Button>
                               
<!-- ── HU COINS PAYMENT ── -->
<asp:HiddenField ID="hfHUCoins" runat="server" Value="0" />
<asp:HiddenField ID="hfHUToken" runat="server" Value="" />
<asp:HiddenField ID="hfHUUserID" runat="server" Value="" />

<div id="hu-coins-section" style="margin-top:15px;padding:15px;
     background:#f0fdf4;border:2px solid #22c55e;
     border-radius:8px;display:none;">
    <p style="margin:0 0 8px;font-weight:bold;
       color:#16a34a;font-size:15px;">
        🪙 HU Coins Available: 
        <span id="hu-coins-display">0</span>
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#555;">
        Coins needed: <span id="hu-coins-needed">0</span>
        &nbsp;(1 Coin = ₹0.10)
    </p>
    <p id="hu-not-enough" 
       style="color:red;font-size:12px;margin:0 0 8px;display:none;">
        ❌ Not enough HU Coins for this order.
    </p>
    <asp:Button ID="ButtonHUCoins" runat="server"
        ValidationGroup="support222"
        OnClick="ButtonHUCoins_Click"
        class="btn"
        style="background:#22c55e;color:white;border:none;
               border-radius:6px;padding:10px 20px;
               font-weight:bold;width:100%;font-size:14px;"
        Text="🪙 Pay with HU Coins" />
</div>

<script>
(function(){
    try {
        var token = localStorage.getItem('hu_token') || '';
        var user  = JSON.parse(localStorage.getItem('hu_user') || '{}');
        var coins = parseInt(user.hu_coins) || 0;

        if (!token || coins <= 0) return;

        document.getElementById('hu-coins-section').style.display = 'block';
        document.getElementById('hu-coins-display').textContent   = coins.toLocaleString();

        var totalEl = document.querySelector('[id$="Label10"]');
        var total   = totalEl ? parseFloat(totalEl.textContent) || 0 : 0;
        var needed  = Math.ceil(total * 10);
        document.getElementById('hu-coins-needed').textContent = needed.toLocaleString();

        document.querySelector('[id$="hfHUCoins"]').value  = coins;
        document.querySelector('[id$="hfHUToken"]').value  = token;
        document.querySelector('[id$="hfHUUserID"]').value = user.id || '';

        if (coins < needed) {
            document.getElementById('hu-not-enough').style.display = 'block';
            var btn = document.querySelector('[id$="ButtonHUCoins"]');
            if (btn) btn.disabled = true;
        }
    } catch(e) {
        console.log('HU error:', e);
    }
})();
</script>


                                   </div>   
                                </div>
                          
                    </div>
                </div>
                <!-- End Banner 2 columns -->


            </div>
              <div class="container" style="display:none" id="Formtwo" runat="server">
            <div  class="col-md-8 mb-3 mb-md-0">
                                    <div style="padding:20px !important;margin:5px !important;border:solid dimgrey 2px !important;">

     <p id="p1" runat="server" style="padding:5px !important;background-color:green !important;color:white !important;padding-left:15px !important;margin-bottom:0px !important;margin-bottom:15px !important;"><i class="fa fa-check"></i> &nbsp; <b>Great!</b> You Appointment was Successfully Book.</p>
     <p id="p2" runat="server" style="padding:5px !important;background-color:red !important;color:white !important;padding-left:15px !important;margin-bottom:0px !important;margin-bottom:15px !important;"><i class="fa fa-warning"></i> &nbsp; <b>Sorry!</b> Invalid field data!</p>
   <%--  <p id="offertag" runat="server" style="padding:10px !important;background-color:white !important;color:black !important;width:100% !important;border:solid silver thin !important;"><b>Early Bird Offer</b><br/>Congratulations! You are eligible for flat 100 OFF on this order. Welcome to <b> Healthy Universe</b>.</p>
  		--%>
                                            <h3 class="section-title section-title__full mb-0 pb-2 font-size-17" style="font-weight:bold !important;margin-bottom:25px !important;margin-top:0px !important;">A. Doctor Related Information</h3>
<%--                     <p style="float:right !important;font-size:12px !important;margin-top: 0.5rem !important;margin-bottom: 0.2rem !important;font-weight:bold !important;">Swipe For More <i class="fa fa-arrow-alt-circle-right"></i></p>--%>


                             <div class="form-group">
					            <label style="margin-bottom:0px !important;"><b>Booking Time</b>: <asp:Label ID="Label1" runat="server"></asp:Label></label>
                            </div>


                  <hr/>
                           <p style="margin-bottom: 0.275rem !important;">Your Total <span style="float:right !important;font-weight:bold !important;font-size:15px !important;">₹ <asp:Label ID="Label7" runat="server"></asp:Label>.00</span></p>
                          <%-- <p style="margin-bottom: 0.275rem !important;">Delivery Fee <asp:Label ID="Label13" style="font-weight:bold !important;color:blue !important;font-size:12px !important;" runat="server"></asp:Label> <span style="float:right !important;font-weight:bold !important;font-size:15px !important;">₹ <asp:Label ID="Label6" runat="server" Text="54.00"></asp:Label></span></p>
                       
                           <p style="margin-bottom: 0.275rem !important;"><span id="tag" runat="server">Discount</span><span id="tag1" runat="server" style="float:right !important;font-weight:bold !important;font-size:15px !important;">(-) ₹ <asp:Label ID="Label7" runat="server"></asp:Label></span></p>
                           
                                --%>
                              
                           <p>To Pay <span style="float:right !important;font-size:24px !important;font-weight:bold !important;margin-top:-3px !important;">₹<asp:Label ID="Label13" runat="server"></asp:Label>.00</span></p>
                     
                                 <div class="form-group">

							<label>Your Contact No <asp:RequiredFieldValidator ID="RequiredFieldValidator7" 
                                        ValidationGroup="Doctor222" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox8"></asp:RequiredFieldValidator> <asp:RegularExpressionValidator ID="RegularExpressionValidator3" ForeColor="Red"
                             runat="server" ControlToValidate="TextBox2" ValidationGroup="support222"
                             ErrorMessage="Enter a 10 digit IN number"  
                             ValidationExpression="^\d{10}$"></asp:RegularExpressionValidator></label>
                                    
                                        <asp:TextBox ID="TextBox8" MaxLength="10" OnTextChanged="TextBox2_TextChanged" AutoPostBack="false" class="form-control" style="border-radius: 0rem !important;" onkeypress="return isNumberKey(event)" placeholder="10 Digit contact no here..." runat="server"></asp:TextBox>
					
						        </div> 
                                  <div class="form-group">

							<label>Contact Person <asp:RequiredFieldValidator ID="RequiredFieldValidator8" 
                                        ValidationGroup="Doctor222" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox9"></asp:RequiredFieldValidator></label>
                                      
                                        <asp:TextBox ID="TextBox9" OnTextChanged="TextBox3_TextChanged" AutoPostBack="false" class="form-control" style="border-radius: 0rem !important;" placeholder="Your name here..." runat="server"></asp:TextBox>
						        </div>
                      <div class="form-group">

							<label>Email Address <asp:RequiredFieldValidator ID="RequiredFieldValidator10" 
                                        ValidationGroup="Doctor222" runat="server" Text="*" 
                                style="color:red !important" 
                                        ControlToValidate="TextBox11"></asp:RequiredFieldValidator></label>
                                      
                                        <asp:TextBox ID="TextBox11" OnTextChanged="TextBox7_TextChanged" AutoPostBack="false"  class="form-control" style="border-radius: 0rem !important;" placeholder="Communication Email Address here..." runat="server"></asp:TextBox>
						        </div>
                                               <div class="form-group">

							<label>Appointment date</label>
                                      
                                        <asp:TextBox ID="TextBox12" TextMode="DateTimeLocal" class="form-control" style="border-radius: 0rem !important;" runat="server"></asp:TextBox>
						        </div>

                               <asp:Button ID="Button5" runat="server" ValidationGroup="Doctor222" OnClick="Button5_Click1"  class="btn btn-light" style="border:solid silver thin !important;border-radius: 0rem !important;" Text="Pay Now"></asp:Button>
                            
                                   </div>   
                                </div>

</div>
                      
           </main>

</asp:Content>

