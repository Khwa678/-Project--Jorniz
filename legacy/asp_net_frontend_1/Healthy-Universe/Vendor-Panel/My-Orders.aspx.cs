using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Script.Serialization;
using System.Data;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Security;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.IO;

using System.Net;
using System.Collections.Specialized;
using System.Net.Mail;

using System.Security.Cryptography;


public partial class My_Orders : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

      
        if (!this.IsPostBack)
        {
            HttpCookie returnCookie1 = Request.Cookies["mygoacookie1"];
            if ((returnCookie1 == null) || string.IsNullOrEmpty(returnCookie1.Value))
            {
                Response.Redirect("Login.aspx");
            }
            else
            {

                    HttpCookie mydealloscookie2 = Request.Cookies["mydealloscookie2"];
                   
                    DataTable dt = new DataTable();
                    SqlDataAdapter adp = new SqlDataAdapter();
                    string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                    using (SqlConnection con = new SqlConnection(constr))
                    {
                        SqlCommand cmd = new SqlCommand("select * from Transactions WHERE (Customerid = " + returnCookie1.Value + ") ORDER BY Id DESC", con);
                        adp.SelectCommand = cmd;
                        adp.Fill(dt);
                        if (dt.Rows.Count > 0)
                        {
                        rptCustomers.DataSource = dt;
                        rptCustomers.DataBind();
                        emptylist.Style.Add("display", "none");
                        }
                        else
                        {
                        rptCustomers.DataSource = null;
                        rptCustomers.DataBind();
                        emptylist.Style.Add("display", "block");
                        }
                    }
                    dt.Clear();
                    dt.Dispose();
                    adp.Dispose();
            }

        }
    }
    
    private static DataTable GetData(string query)
    {
        string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        using (SqlConnection con = new SqlConnection(constr))
        {
            using (SqlCommand cmd = new SqlCommand())
            {
                cmd.CommandText = query;
                using (SqlDataAdapter sda = new SqlDataAdapter())
                {
                    cmd.Connection = con;
                    sda.SelectCommand = cmd;
                    using (DataSet ds = new DataSet())
                    {
                        DataTable dt = new DataTable();
                        sda.Fill(dt);
                        return dt;
                    }
                }
            }
        }
    }
    protected void OnItemDataBound(object sender, RepeaterItemEventArgs e)
    {
        if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
        {
            string paymentstatus = (e.Item.FindControl("Label8") as Label).Text;
            Button action1 = e.Item.FindControl("Buttoncontrol") as Button;
            if (paymentstatus == "DELIVERED" || paymentstatus == "CANCELLED" || paymentstatus == "IN-TRANSIT / DELIVERED")
            {
                action1.Style.Add("display", "none");
            }
            else
            {
                action1.Style.Add("display", "block");
            }

            HtmlGenericControl action11 = e.Item.FindControl("deliveryinfo") as HtmlGenericControl;

            if (paymentstatus == "IN-TRANSIT / DELIVERED")
            {
                action11.Style.Add("display", "block");
            }
            else
            {
                action11.Style.Add("display", "none");
            }

            string customerId = (e.Item.FindControl("hfCustomerId") as HiddenField).Value;
            Repeater rptOrders = e.Item.FindControl("rptOrders") as Repeater;
            rptOrders.DataSource = GetData(string.Format("SELECT * FROM Orderssub WHERE Oid='{0}'", customerId));
            rptOrders.DataBind();
        }
    }
    protected void GetValue(object sender, EventArgs e)
    {
        try
        {
            //Reference the Repeater Item using Button.
            RepeaterItem item = (sender as Button).NamingContainer as RepeaterItem;

            //Reference the Label and TextBox.
            string tid = (item.FindControl("Label7") as Label).Text;
            string paymentstatus = (item.FindControl("Label8") as Label).Text;

            if (paymentstatus == "DELIVERED" || paymentstatus == "CANCELLED")
            {
                Response.Write("<script>alert('This order is already delivered or Cancelled. Action not allowed!')</script>");
            }
            else
            {
                string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                using (SqlConnection con1 = new SqlConnection(constr))
                {
                    con1.Open();
                    SqlCommand cmd1 = new SqlCommand("update Transactions set Paymentstatus=@Paymentstatus WHERE Id=@Id", con1);
                    cmd1.Parameters.AddWithValue("@Paymentstatus", "CANCELLED");
                    cmd1.Parameters.AddWithValue("@Id", tid);
                    cmd1.ExecuteNonQuery();
                    con1.Close();
                }

                HttpCookie mydealloscookie2 = Request.Cookies["mydealloscookie2"];
                rptCustomers.DataSource = GetData("SELECT * FROM Transactions WHERE (Customerid = " + mydealloscookie2.Value + ") ORDER BY Id DESC");
                rptCustomers.DataBind();
            }


        }
        catch
        {
            Response.Redirect("Error.aspx");
        }


    }
}