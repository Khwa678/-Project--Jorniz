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
using System;
using System.Data;
using System.Configuration;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.IO;
using System.Collections.Generic;
using System.Net;
using System.Collections.Specialized;
using System.Net.Mail;
using System.IO;
using System.Net;
using System.Text;
using System;
using System.Data;
using System.Configuration;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Security.Cryptography;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text;
using System.Net;
using System.Net.Mail;
using System;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Data.SqlClient;
using System.IO;
using System.Web.Script.Serialization;
using System.Security.Cryptography;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;

public partial class System_Administrator_Orders : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!this.IsPostBack)
        {
            rptCustomers.DataSource = GetData("SELECT * FROM Transactions ORDER BY Id DESC");
            rptCustomers.DataBind();
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
            string customerId = (e.Item.FindControl("hfCustomerId") as HiddenField).Value;
            Repeater rptOrders = e.Item.FindControl("rptOrders") as Repeater;
            rptOrders.DataSource = GetData(string.Format("SELECT * FROM Orderssub WHERE Oid='{0}'", customerId));
            rptOrders.DataBind();

            string strConnString = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            RepeaterItem item = e.Item;

            //Reference the Controls.
            string tid = (item.FindControl("Label16") as Label).Text;

            try
            {
                string customerid, addressid;
                string str1 = " SELECT * FROM Transactions WHERE Id = @Id";
                string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                using (SqlConnection connection = new SqlConnection(strConnString1))
                {
                    //parametrized query to prevent SQL Injection
                    SqlCommand command = new SqlCommand(str1, connection);
                    command.Parameters.Add("@Id", tid);
                    connection.Open();
                    SqlDataReader reader = command.ExecuteReader();
                    reader.Read();

                    customerid = reader["Customerid"].ToString();
                    addressid = reader["Addressid"].ToString();

                    reader.Close();
                    connection.Close();
                }

               



                string str11 = " SELECT * FROM Customers WHERE Id = @Id";
                string strConnString11 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                using (SqlConnection connection = new SqlConnection(strConnString11))
                {
                    //parametrized query to prevent SQL Injection
                    SqlCommand command = new SqlCommand(str11, connection);
                    command.Parameters.Add("@Id", customerid);
                    connection.Open();
                    SqlDataReader reader = command.ExecuteReader();
                    reader.Read();

                    (item.FindControl("Label8") as Label).Text = reader["Name"].ToString();
                    (item.FindControl("Label9") as Label).Text = reader["Email"].ToString();
                    (item.FindControl("Label10") as Label).Text = reader["Contact"].ToString();

                    reader.Close();
                    connection.Close();
                }

                string str111 = " SELECT * FROM Addresses WHERE Id = @Id";
                string strConnString111 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                using (SqlConnection connection = new SqlConnection(strConnString111))
                {
                    //parametrized query to prevent SQL Injection
                    SqlCommand command = new SqlCommand(str111, connection);
                    command.Parameters.Add("@Id", addressid);
                    connection.Open();
                    SqlDataReader reader = command.ExecuteReader();
                    reader.Read();

                    (item.FindControl("Label11") as Label).Text = reader["Faddress"].ToString();
                    (item.FindControl("Label12") as Label).Text = reader["Landmark"].ToString();
                    (item.FindControl("Label13") as Label).Text = reader["Area"].ToString();
                    (item.FindControl("Label14") as Label).Text = reader["City"].ToString();
                    (item.FindControl("Label15") as Label).Text = reader["Atype"].ToString();
                    (item.FindControl("Label19") as Label).Text = reader["State"].ToString();
                    (item.FindControl("Label22") as Label).Text = reader["Areacode"].ToString();

                    reader.Close();
                    connection.Close();
                }


                string paymentstatus = (e.Item.FindControl("Label18") as Label).Text;
                Button action1 = e.Item.FindControl("Buttoncontrol") as Button;
                TextBox action2 = e.Item.FindControl("TextBox1") as TextBox;

                if (paymentstatus == "DELIVERED" || paymentstatus == "CANCELLED" || paymentstatus == "IN-TRANSIT / DELIVERED")
                {
                    action1.Style.Add("display", "none");
                    action2.Style.Add("display", "none");
                }
                else
                {
                    action1.Style.Add("display", "block");
                    action2.Style.Add("display", "block");
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
            }
            catch
            {

            }

        }
    }
    protected void GetValue(object sender, EventArgs e)
    {
        try
        {
            //Reference the Repeater Item using Button.
            RepeaterItem item = (sender as Button).NamingContainer as RepeaterItem;

            //Reference the Label and TextBox.
            string tid = (item.FindControl("Label17") as Label).Text;
            string awb = (item.FindControl("TextBox1") as TextBox).Text;

            string paymentstatus = (item.FindControl("Label18") as Label).Text;

            if (paymentstatus == "DELIVERED" || paymentstatus == "CANCELLED")
            {
                Response.Write("<script>alert('This order is already delivered or Cancelled. Action not allowed!')</script>");
            }
            else
            {


                if(awb == "" || awb == string.Empty || awb == null)
                {
                    Response.Write("<script>alert('Recheck delivery details. Action Rejected!')</script>");
                }
                else
                {
                    string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                    using (SqlConnection con1 = new SqlConnection(constr))
                    {
                        con1.Open();
                        SqlCommand cmd1 = new SqlCommand("update Transactions set Paymentstatus=@Paymentstatus, Awbno=@Awbno WHERE Id=@Id", con1);
                        cmd1.Parameters.AddWithValue("@Paymentstatus", "IN-TRANSIT / DELIVERED");
                        cmd1.Parameters.AddWithValue("@Awbno", awb);
                        cmd1.Parameters.AddWithValue("@Id", tid);
                        cmd1.ExecuteNonQuery();
                        con1.Close();
                    }

                    rptCustomers.DataSource = GetData("SELECT * FROM Transactions ORDER BY Id DESC");
                    rptCustomers.DataBind();
                }

                
            }


        }
        catch
        {
            Response.Redirect("Error.aspx");
        }
    }

}