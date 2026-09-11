<%@ Page Title="Shopping Cart | Healthy Universe" Language="C#" MasterPageFile="~/MasterPage.master" AutoEventWireup="true" CodeFile="Cart.aspx.cs" Inherits="Cart" %>
<%@ Register Src="CartControl.ascx" TagName="CartControl" TagPrefix="uc1" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
     <uc1:CartControl ID="CartControl1" runat="server" />
</asp:Content>

