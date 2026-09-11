<%@ Page Title="" Language="C#" MasterPageFile="~/System-Administrator/MasterPage.master" AutoEventWireup="true" CodeFile="testing.aspx.cs" Inherits="System_Administrator_testing" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" Runat="Server">
    <asp:GridView ID="GridView1"  style="margin:300px !important" runat="server" AutoGenerateColumns="False" EmptyDataText="There Is No Records In Database!"
    AllowPaging="true" PageSize="10" OnPageIndexChanging="OnPaging" AllowSorting="true" OnSorting="GridView1_Sorting">
    <Columns>
        <asp:BoundField DataField="ID" SortExpression="CustomerID" HeaderText="CustomerID" />
        <asp:BoundField DataField="Title" SortExpression="ContactName" HeaderText="ContactName" />
        <asp:TemplateField>
            <HeaderTemplate>
                Section
                <asp:DropDownList ID="section" runat="server" SortExpression="section"
                    AutoPostBack="true" OnSelectedIndexChanged="DeptChanged"
                    AppendDataBoundItems="true">
                    <asp:ListItem Text="ALL" Value="ALL"></asp:ListItem>
                    <asp:ListItem Text="Top 10" Value="10"></asp:ListItem>
                </asp:DropDownList>
            </HeaderTemplate>
            <ItemTemplate>
                <%# Eval("Title") %>
            </ItemTemplate>
        </asp:TemplateField>
    </Columns>
</asp:GridView>
</asp:Content>

