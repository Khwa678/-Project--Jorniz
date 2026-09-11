<%@ Page Title="Explore Shop | Healthy Universe" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Search.aspx.cs" Inherits="Search" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
      <main id="content" role="main">
         <div class="container">

              <div class="py-2" style="margin-bottom:0px !important;margin-top: 10px !important;">
                <div class="container" style="padding-left:0px !important;">
                    <div class="flex-center-between d-block d-md-flex">
                        <div class="mb-3 mb-md-0">                
                       <p style="margin-bottom:0em !important">
                            <a href="Default.aspx"><i class="fa fa-home"></i></a>
                            <a href="Search.aspx"> / <b>Explore</b></a>
                            <a id="categoryname" style="display:none !important;" runat="server"> / <asp:Label ID="Label8" style="color:black !important" runat="server"></asp:Label></a>
                            <a id="subcategoryname" style="display:none !important;" runat="server"> / <asp:Label ID="Label9" style="color:black !important" runat="server"></asp:Label></a>
                            <a id="displaying" style="display:none !important" runat="server" href="#"> / <span style="color:black !important">Displaying All Products</span></a>
                            <a id="searchterm" style="display:none !important" runat="server" href="#"> / <asp:Label style="color:black !important" ID="Label11" runat="server"></asp:Label></a>
                            </p>
                                         </div>
                                     </div>
                                 </div>
                            </div>
               <hr style="
    margin-top: 0.2rem !important;
" />
             <div class="row list-unstyled products-group no-gutters" style="margin-bottom:40px !important;">     
             <asp:Repeater ID="Repeater1" runat="server" OnItemDataBound="Repeater1_ItemDataBound">
                                                <ItemTemplate>
                                            <div class="col-6 col-wd-2 col-md-2">
                                               <div style="padding:5px !important;margin:5px !important;border:solid #f2f2f2 2px !important;min-height:230px !important;">	                                      
                                            <asp:Label ID="Label1" style="display:none !important;" Text='<%# Eval("Price") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label2" style="display:none !important;" Text='<%# Eval("Price1") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label3" style="display:none !important;" Text='<%# Eval("Quantity") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label4" style="display:none !important;" Text='<%# Eval("Id") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label5" style="display:none !important;" Text='<%# Eval("Weight") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label6" style="display:none !important;" Text='<%# Eval("Title") %>' runat="server"></asp:Label>
                                             <asp:Label ID="Label7" style="display:none !important;" Text='<%# Eval("Path1") %>' runat="server"></asp:Label>                                                                               
	                                            <figure style="margin-bottom:12px !important;">
                                                    <span id="discounttag" style="font-weight:bold !important;font-size:13px !important;margin-top:10px !important;position:absolute !important;margin-left:10px !important;padding:3px 5px !important;background-color:black;color:black !important;font-family:'Open Sans', sans-serif !important;color:white !important;" runat="server"><asp:Label ID="Label8" style="color:white !important;" runat="server"></asp:Label>% OFF</span>
                                           <asp:linkbutton id="Linkbutton3" href='<%#"Shop-Details.aspx?pid="+Eval("Id")%>' runat="server">
	                                            <asp:Image ID="imgPhoto" style="width:100% !important;height:auto !important;margin:auto !important;" class="lazy" ImageUrl='<%#Bind("Path1") %>' runat="server" />
                                           </asp:linkbutton>
                                                </figure>
                                            <p style="margin-bottom:0rem !important;margin-bottom:0rem !important;font-weight:bold !important;"> 
                                               <asp:linkbutton id="Linkbutton4" style="font-size: 12px !important;font-family:'Open Sans', sans-serif !important;color: #555 !important;line-height:12px !important;" href='<%#"Shop-Details.aspx?pid="+Eval("Id")%>' runat="server">
	                                            <%# Eval("Title").ToString().PadRight(45).Substring(0,45).TrimEnd() %>
	                                             </asp:linkbutton></p>                                                
                                             <%--<div class="text-warning mb-2">
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                        <small class="fas fa-star"></small>
                                    </div>--%>
                                              <p style="display:none !important;"><asp:Label ID="Label101" Text='<%# Eval("Weight") %>' runat="server"></asp:Label></p>
                                                   <p style="margin-bottom: 0rem !important;"><span  id="display1" runat="server"><strong style="text-decoration:line-through;color:red !important;font-size:14px !important;margin-right:10px !important;"><asp:Label ID="Label1x" Text='<%# Eval("Price1") %>' runat="server"></asp:Label>₹</strong></span>
                                                         <span style="font-size:12px !important;font-weight:bold !important;color:black !important;"><asp:Label ID="Label1y" Text='<%# Eval("Price") %>' runat="server"></asp:Label>₹</span></p>
                                                            	                                      
	                                     </div>

                                            </div>

                                                  </ItemTemplate>
                                                </asp:Repeater>
             <div id="emptylist" style="display:none !important;width:100% !important" runat="server">
                                                    <div style="width:70% !important;margin:auto !important;padding:20px !important;border:solid #f2f2f2 thin !important;margin-top:20px !important;">
                                                        <table style="width:100% !important">
                                                            <tr>
           <td style="padding:0px !important;width:40% !important;text-align:center !important;">
<img style="width:70% !important;height:auto !important;margin:auto !important" src="Images/noproduct.png" />
                                                                </td>
                                                                <td style="padding:0px !important;width:60% !important">
<h2 style="padding-top:30px;font-size:22px !important;">We are <b>SORRY</b> for the inconvinience!</h2>
                          <p>Looks like we cannot find anything useful for this search criteria. Please recheck the search phrase for grammatical errors or rephrase your search term.</p>
                           
                                                <a  href="Search.aspx" class="btn btn-dark"><i class="tm tm-long-arrow-right"></i> Explore All Products</a>
                                               
                                                                </td>
                                                            </tr>
                                                            </table>
                                                    </div>
                                                </div>

                              
                      
                 </div>
             </div>
            </main>
</asp:Content>

