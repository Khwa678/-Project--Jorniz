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
using System.Text;
using System.Security.Cryptography;

public partial class Checkout : System.Web.UI.Page
{
    string oid;
    DateTime serverTime; // gives you current Time in server timeZone
    DateTime utcTime; // convert it to Utc using timezone setting of server computer

    TimeZoneInfo tzi;
    DateTime localTime;
    protected void Page_Load(object sender, EventArgs e)
    {

        failed.Style.Add("display", "none");
        success2.Style.Add("display", "none");

        pfailed.Style.Add("display", "none");
        psuccess.Style.Add("display", "none");
        p1.Style.Add("display", "none");
        p2.Style.Add("display", "none");

        HttpCookie afcookie = Request.Cookies["afcookie"];
        //Label101.Text = afcookie.Value;

        if (DropDownList4.SelectedItem.Value == "0")
        {
            Formtwo.Style.Add("Display", "block");
            Formone.Style.Add("Display", "none");
            HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
            try
            {
                if ((returnCookie1 == null) || string.IsNullOrEmpty(returnCookie1.Value))
                {
                    Response.Redirect("Login.aspx");
                }
                else
                {
                    try
                    {
                        oid = Decrypt(HttpUtility.UrlDecode(Request.QueryString["oid"]));
                        Label2.Text = oid;

                        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                        SqlConnection conn = new SqlConnection(constring);
                        DataSet ds = new DataSet();
                        DataTable FromTable = new DataTable();
                        conn.Open();
                        string cmdstr = "SELECT * FROM Orderssub WHERE Oid=@Oid";
                        SqlCommand cmd = new SqlCommand(cmdstr, conn);
                        cmd.Parameters.Add("@Oid", oid);
                        SqlDataAdapter adp = new SqlDataAdapter(cmd);
                        adp.Fill(ds);
                        Repeater1.DataSource = ds.Tables[0];
                        Repeater1.DataBind();
                        conn.Close();

                        string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                        string str1 = " SELECT * FROM Orders WHERE Id = @Id";
                        using (SqlConnection connection = new SqlConnection(strConnString1))
                        {
                            //parametrized query to prevent SQL Injection
                            SqlCommand command = new SqlCommand(str1, connection);
                            command.Parameters.Add("@Id", oid);
                            connection.Open();
                            SqlDataReader reader = command.ExecuteReader();
                            reader.Read();
                            Label5.Text = reader["Total"].ToString();
                            Label7.Text = reader["Total"].ToString();
                            Label13.Text = reader["Total"].ToString();
                            reader.Close();
                            connection.Close();
                        }

                        int netorders;
                        string str111 = " SELECT Count(*) FROM Transactions WHERE Customerid = @Customerid AND (((Paymenttype = @Paymenttype AND  Paymentstatus = @Paymentstatus) OR (Paymenttype = @Paymenttype3 AND  Paymentstatus = @Paymentstatus3)) OR ((Paymenttype = @Paymenttype1 AND  Paymentstatus = @Paymentstatus1) OR (Paymenttype = @Paymenttype2 AND  Paymentstatus = @Paymentstatus2)))";
                        using (SqlConnection connection = new SqlConnection(strConnString1))
                        {
                            SqlCommand command = new SqlCommand(str111, connection);
                            command.Parameters.Add("@Customerid", returnCookie1.Value);

                            command.Parameters.Add("@Paymenttype", "Online");
                            command.Parameters.Add("@Paymentstatus", "Complete");

                            command.Parameters.Add("@Paymenttype3", "Online");
                            command.Parameters.Add("@Paymentstatus3", "DELIVERED");

                            command.Parameters.Add("@Paymenttype1", "COD");
                            command.Parameters.Add("@Paymentstatus1", "PENDING");

                            command.Parameters.Add("@Paymenttype2", "COD");
                            command.Parameters.Add("@Paymentstatus2", "DELIVERED");

                            connection.Open();
                            netorders = Convert.ToInt32(command.ExecuteScalar());
                            connection.Close();
                        }

                        //if (netorders == 0)
                        //{

                        //    if (Convert.ToInt32(Label5.Text) > 599)
                        //    {
                        //        Label7.Text = "100.00";
                        //        tag.Style.Add("display", "inline-block");
                        //        tag1.Style.Add("display", "inline-block");
                        //        offertag.Style.Add("display", "block");
                        //    }
                        //    else
                        //    {
                        //        Label7.Text = "0.00";
                        //        tag.Style.Add("display", "none");
                        //        tag1.Style.Add("display", "none");
                        //        offertag.Style.Add("display", "none");
                        //    }


                        //}
                        //else
                        //{
                        //    Label7.Text = "0.00";
                        //    tag.Style.Add("display", "none");
                        //    tag1.Style.Add("display", "none");
                        //    offertag.Style.Add("display", "none");
                        //}






                        //if (Convert.ToDouble(Label5.Text) > 249)
                        //{
                        //    double nettotal = Convert.ToDouble(Label5.Text) - Convert.ToDouble(Label7.Text);
                        //    Label6.Text = "0.00";
                        //    Label13.Text = " FREE";
                        //    Label10.Text = nettotal.ToString();
                        //}
                        //else
                        //{
                        //    double nettotal = Convert.ToDouble(Label5.Text) + Convert.ToDouble(Label6.Text) - Convert.ToDouble(Label7.Text);
                        //    Label10.Text = nettotal.ToString();
                        //}

                        Label10.Text = Label5.Text.ToString();


                        if (!this.IsPostBack)
                        {

                            serverTime = DateTime.Now; // gives you current Time in server timeZone
                            utcTime = serverTime.ToUniversalTime(); // convert it to Utc using timezone setting of server computer

                            tzi = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
                            localTime = TimeZoneInfo.ConvertTimeFromUtc(utcTime, tzi);


                            //DateTime otime = DateTime.Now;
                            Label15.Text = localTime.ToString("h:mm tt");
                            Label1.Text = localTime.ToString("h:mm tt");


                        }
                    }
                    catch
                    {
                        Response.Redirect("Error.aspx");
                    }

                }

            }
            catch
            {
                if ((returnCookie1 == null) || string.IsNullOrEmpty(returnCookie1.Value))
                {
                    Response.Redirect("Login.aspx");
                }
                else
                {
                    try
                    {
                        oid = Decrypt(HttpUtility.UrlDecode(Request.QueryString["oid"]));
                        Label2.Text = oid;

                        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                        SqlConnection conn = new SqlConnection(constring);
                        DataSet ds = new DataSet();
                        DataTable FromTable = new DataTable();
                        conn.Open();
                        string cmdstr = "SELECT * FROM Orderssub WHERE Oid=@Oid";
                        SqlCommand cmd = new SqlCommand(cmdstr, conn);
                        cmd.Parameters.Add("@Oid", oid);
                        SqlDataAdapter adp = new SqlDataAdapter(cmd);
                        adp.Fill(ds);
                        Repeater1.DataSource = ds.Tables[0];
                        Repeater1.DataBind();
                        conn.Close();

                        string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                        string str1 = " SELECT * FROM Orders WHERE Id = @Id";
                        using (SqlConnection connection = new SqlConnection(strConnString1))
                        {
                            //parametrized query to prevent SQL Injection
                            SqlCommand command = new SqlCommand(str1, connection);
                            command.Parameters.Add("@Id", oid);
                            connection.Open();
                            SqlDataReader reader = command.ExecuteReader();
                            reader.Read();
                            Label5.Text = reader["Total"].ToString();
                            reader.Close();
                            connection.Close();
                        }

                        int netorders;
                        string str111 = " SELECT Count(*) FROM Transactions WHERE Customerid = @Customerid AND (((Paymenttype = @Paymenttype AND  Paymentstatus = @Paymentstatus) OR (Paymenttype = @Paymenttype3 AND  Paymentstatus = @Paymentstatus3)) OR ((Paymenttype = @Paymenttype1 AND  Paymentstatus = @Paymentstatus1) OR (Paymenttype = @Paymenttype2 AND  Paymentstatus = @Paymentstatus2)))";
                        using (SqlConnection connection = new SqlConnection(strConnString1))
                        {
                            SqlCommand command = new SqlCommand(str111, connection);
                            command.Parameters.Add("@Customerid", returnCookie1.Value);

                            command.Parameters.Add("@Paymenttype", "Online");
                            command.Parameters.Add("@Paymentstatus", "Complete");

                            command.Parameters.Add("@Paymenttype3", "Online");
                            command.Parameters.Add("@Paymentstatus3", "DELIVERED");

                            command.Parameters.Add("@Paymenttype1", "COD");
                            command.Parameters.Add("@Paymentstatus1", "PENDING");

                            command.Parameters.Add("@Paymenttype2", "COD");
                            command.Parameters.Add("@Paymentstatus2", "DELIVERED");

                            connection.Open();
                            netorders = Convert.ToInt32(command.ExecuteScalar());
                            connection.Close();
                        }

                        //if (netorders == 0)
                        //{

                        //    if (Convert.ToInt32(Label5.Text) > 599)
                        //    {
                        //        Label7.Text = "100.00";
                        //        tag.Style.Add("display", "inline-block");
                        //        tag1.Style.Add("display", "inline-block");
                        //        offertag.Style.Add("display", "block");
                        //    }
                        //    else
                        //    {
                        //        Label7.Text = "0.00";
                        //        tag.Style.Add("display", "none");
                        //        tag1.Style.Add("display", "none");
                        //        offertag.Style.Add("display", "none");
                        //    }


                        //}
                        //else
                        //{
                        //    Label7.Text = "0.00";
                        //    tag.Style.Add("display", "none");
                        //    tag1.Style.Add("display", "none");
                        //    offertag.Style.Add("display", "none");
                        //}






                        //if (Convert.ToDouble(Label5.Text) > 249)
                        //{
                        //    double nettotal = Convert.ToDouble(Label5.Text) - Convert.ToDouble(Label7.Text);
                        //    Label6.Text = "0.00";
                        //    Label13.Text = " FREE";
                        //    Label10.Text = nettotal.ToString();
                        //}
                        //else
                        //{
                        //    double nettotal = Convert.ToDouble(Label5.Text) + Convert.ToDouble(Label6.Text) - Convert.ToDouble(Label7.Text);
                        //    Label10.Text = nettotal.ToString();
                        //}
                        Label10.Text = Label5.Text.ToString();

                        if (!this.IsPostBack)
                        {


                            serverTime = DateTime.Now; // gives you current Time in server timeZone
                            utcTime = serverTime.ToUniversalTime(); // convert it to Utc using timezone setting of server computer

                            tzi = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
                            localTime = TimeZoneInfo.ConvertTimeFromUtc(utcTime, tzi);


                            //DateTime otime = DateTime.Now;
                            Label15.Text = localTime.ToString("h:mm tt");
                            Label1.Text = localTime.ToString("h:mm tt");


                        }
                    }
                    catch
                    {
                        Response.Redirect("Error.aspx");
                    }

                }
            }
        }
        else if (DropDownList4.SelectedItem.Value == "1")
        {
            Formone.Style.Add("Display", "flex");
            Formtwo.Style.Add("Display", "none");
            HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
            try
            {
                if ((returnCookie1 == null) || string.IsNullOrEmpty(returnCookie1.Value))
                {
                    Response.Redirect("Login.aspx");
                }
                else
                {
                    try
                    {
                        oid = Decrypt(HttpUtility.UrlDecode(Request.QueryString["oid"]));
                        Label2.Text = oid;

                        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                        SqlConnection conn = new SqlConnection(constring);
                        DataSet ds = new DataSet();
                        DataTable FromTable = new DataTable();
                        conn.Open();
                        string cmdstr = "SELECT * FROM Orderssub WHERE Oid=@Oid";
                        SqlCommand cmd = new SqlCommand(cmdstr, conn);
                        cmd.Parameters.Add("@Oid", oid);
                        SqlDataAdapter adp = new SqlDataAdapter(cmd);
                        adp.Fill(ds);
                        Repeater1.DataSource = ds.Tables[0];
                        Repeater1.DataBind();
                        conn.Close();

                        string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                        string str1 = " SELECT * FROM Orders WHERE Id = @Id";
                        using (SqlConnection connection = new SqlConnection(strConnString1))
                        {
                            //parametrized query to prevent SQL Injection
                            SqlCommand command = new SqlCommand(str1, connection);
                            command.Parameters.Add("@Id", oid);
                            connection.Open();
                            SqlDataReader reader = command.ExecuteReader();
                            reader.Read();
                            Label5.Text = reader["Total"].ToString();
                            Label7.Text = reader["Total"].ToString();
                            reader.Close();
                            connection.Close();
                        }

                        int netorders;
                        string str111 = " SELECT Count(*) FROM Transactions WHERE Customerid = @Customerid AND (((Paymenttype = @Paymenttype AND  Paymentstatus = @Paymentstatus) OR (Paymenttype = @Paymenttype3 AND  Paymentstatus = @Paymentstatus3)) OR ((Paymenttype = @Paymenttype1 AND  Paymentstatus = @Paymentstatus1) OR (Paymenttype = @Paymenttype2 AND  Paymentstatus = @Paymentstatus2)))";
                        using (SqlConnection connection = new SqlConnection(strConnString1))
                        {
                            SqlCommand command = new SqlCommand(str111, connection);
                            command.Parameters.Add("@Customerid", returnCookie1.Value);

                            command.Parameters.Add("@Paymenttype", "Online");
                            command.Parameters.Add("@Paymentstatus", "Complete");

                            command.Parameters.Add("@Paymenttype3", "Online");
                            command.Parameters.Add("@Paymentstatus3", "DELIVERED");

                            command.Parameters.Add("@Paymenttype1", "COD");
                            command.Parameters.Add("@Paymentstatus1", "PENDING");

                            command.Parameters.Add("@Paymenttype2", "COD");
                            command.Parameters.Add("@Paymentstatus2", "DELIVERED");

                            connection.Open();
                            netorders = Convert.ToInt32(command.ExecuteScalar());
                            connection.Close();
                        }

                        //if (netorders == 0)
                        //{

                        //    if (Convert.ToInt32(Label5.Text) > 599)
                        //    {
                        //        Label7.Text = "100.00";
                        //        tag.Style.Add("display", "inline-block");
                        //        tag1.Style.Add("display", "inline-block");
                        //        offertag.Style.Add("display", "block");
                        //    }
                        //    else
                        //    {
                        //        Label7.Text = "0.00";
                        //        tag.Style.Add("display", "none");
                        //        tag1.Style.Add("display", "none");
                        //        offertag.Style.Add("display", "none");
                        //    }


                        //}
                        //else
                        //{
                        //    Label7.Text = "0.00";
                        //    tag.Style.Add("display", "none");
                        //    tag1.Style.Add("display", "none");
                        //    offertag.Style.Add("display", "none");
                        //}






                        //if (Convert.ToDouble(Label5.Text) > 249)
                        //{
                        //    double nettotal = Convert.ToDouble(Label5.Text) - Convert.ToDouble(Label7.Text);
                        //    Label6.Text = "0.00";
                        //    Label13.Text = " FREE";
                        //    Label10.Text = nettotal.ToString();
                        //}
                        //else
                        //{
                        //    double nettotal = Convert.ToDouble(Label5.Text) + Convert.ToDouble(Label6.Text) - Convert.ToDouble(Label7.Text);
                        //    Label10.Text = nettotal.ToString();
                        //}

                        Label10.Text = Label5.Text.ToString();


                        if (!this.IsPostBack)
                        {

                            serverTime = DateTime.Now; // gives you current Time in server timeZone
                            utcTime = serverTime.ToUniversalTime(); // convert it to Utc using timezone setting of server computer

                            tzi = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
                            localTime = TimeZoneInfo.ConvertTimeFromUtc(utcTime, tzi);


                            //DateTime otime = DateTime.Now;
                            Label15.Text = localTime.ToString("h:mm tt");
                            Label1.Text = localTime.ToString("h:mm tt");


                            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;


                            using (SqlConnection con = new SqlConnection(constr))
                            {
                                using (SqlCommand cmd1 = new SqlCommand("SELECT Id, Faddress FROM Addresses WHERE Customerid=@Customerid ORDER BY Id DESC"))
                                {
                                    cmd1.Parameters.Add("@Customerid", returnCookie1.Value);
                                    cmd1.CommandType = CommandType.Text;
                                    cmd1.Connection = con;
                                    con.Open();
                                    DropDownList2.DataSource = cmd1.ExecuteReader();
                                    DropDownList2.DataTextField = "Faddress";
                                    DropDownList2.DataValueField = "Id";
                                    DropDownList2.DataBind();
                                    con.Close();
                                }
                            }
                            DropDownList2.Items.Insert(0, new ListItem("--Select Delivery Address--", "0"));

                            try
                            {
                                string contactno, email, name;
                                string str1xy = " SELECT * FROM Customers WHERE Id = @Id";
                                using (SqlConnection connection = new SqlConnection(constring))
                                {
                                    //parametrized query to prevent SQL Injection
                                    SqlCommand command = new SqlCommand(str1xy, connection);
                                    command.Parameters.Add("@Id", returnCookie1.Value);
                                    connection.Open();
                                    SqlDataReader reader = command.ExecuteReader();
                                    reader.Read();
                                    contactno = reader["Contact"].ToString();
                                    email = reader["Email"].ToString();
                                    name = reader["Name"].ToString();
                                    reader.Close();
                                    connection.Close();
                                }

                                Label12.Text = contactno;
                                TextBox2.Text = Label12.Text;

                                Label16.Text = name;
                                TextBox3.Text = Label16.Text;

                                Label17.Text = email;
                                TextBox7.Text = Label17.Text;
                            }
                            catch
                            {

                            }
                        }
                    }
                    catch
                    {
                        Response.Redirect("Error.aspx");
                    }

                }

            }
            catch
            {
                if ((returnCookie1 == null) || string.IsNullOrEmpty(returnCookie1.Value))
                {
                    Response.Redirect("Login.aspx");
                }
                else
                {
                    try
                    {
                        oid = Decrypt(HttpUtility.UrlDecode(Request.QueryString["oid"]));
                        Label2.Text = oid;

                        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                        SqlConnection conn = new SqlConnection(constring);
                        DataSet ds = new DataSet();
                        DataTable FromTable = new DataTable();
                        conn.Open();
                        string cmdstr = "SELECT * FROM Orderssub WHERE Oid=@Oid";
                        SqlCommand cmd = new SqlCommand(cmdstr, conn);
                        cmd.Parameters.Add("@Oid", oid);
                        SqlDataAdapter adp = new SqlDataAdapter(cmd);
                        adp.Fill(ds);
                        Repeater1.DataSource = ds.Tables[0];
                        Repeater1.DataBind();
                        conn.Close();

                        string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
                        string str1 = " SELECT * FROM Orders WHERE Id = @Id";
                        using (SqlConnection connection = new SqlConnection(strConnString1))
                        {
                            //parametrized query to prevent SQL Injection
                            SqlCommand command = new SqlCommand(str1, connection);
                            command.Parameters.Add("@Id", oid);
                            connection.Open();
                            SqlDataReader reader = command.ExecuteReader();
                            reader.Read();
                            Label5.Text = reader["Total"].ToString();
                            reader.Close();
                            connection.Close();
                        }

                        int netorders;
                        string str111 = " SELECT Count(*) FROM Transactions WHERE Customerid = @Customerid AND (((Paymenttype = @Paymenttype AND  Paymentstatus = @Paymentstatus) OR (Paymenttype = @Paymenttype3 AND  Paymentstatus = @Paymentstatus3)) OR ((Paymenttype = @Paymenttype1 AND  Paymentstatus = @Paymentstatus1) OR (Paymenttype = @Paymenttype2 AND  Paymentstatus = @Paymentstatus2)))";
                        using (SqlConnection connection = new SqlConnection(strConnString1))
                        {
                            SqlCommand command = new SqlCommand(str111, connection);
                            command.Parameters.Add("@Customerid", returnCookie1.Value);

                            command.Parameters.Add("@Paymenttype", "Online");
                            command.Parameters.Add("@Paymentstatus", "Complete");

                            command.Parameters.Add("@Paymenttype3", "Online");
                            command.Parameters.Add("@Paymentstatus3", "DELIVERED");

                            command.Parameters.Add("@Paymenttype1", "COD");
                            command.Parameters.Add("@Paymentstatus1", "PENDING");

                            command.Parameters.Add("@Paymenttype2", "COD");
                            command.Parameters.Add("@Paymentstatus2", "DELIVERED");

                            connection.Open();
                            netorders = Convert.ToInt32(command.ExecuteScalar());
                            connection.Close();
                        }

                        //if (netorders == 0)
                        //{

                        //    if (Convert.ToInt32(Label5.Text) > 599)
                        //    {
                        //        Label7.Text = "100.00";
                        //        tag.Style.Add("display", "inline-block");
                        //        tag1.Style.Add("display", "inline-block");
                        //        offertag.Style.Add("display", "block");
                        //    }
                        //    else
                        //    {
                        //        Label7.Text = "0.00";
                        //        tag.Style.Add("display", "none");
                        //        tag1.Style.Add("display", "none");
                        //        offertag.Style.Add("display", "none");
                        //    }


                        //}
                        //else
                        //{
                        //    Label7.Text = "0.00";
                        //    tag.Style.Add("display", "none");
                        //    tag1.Style.Add("display", "none");
                        //    offertag.Style.Add("display", "none");
                        //}






                        //if (Convert.ToDouble(Label5.Text) > 249)
                        //{
                        //    double nettotal = Convert.ToDouble(Label5.Text) - Convert.ToDouble(Label7.Text);
                        //    Label6.Text = "0.00";
                        //    Label13.Text = " FREE";
                        //    Label10.Text = nettotal.ToString();
                        //}
                        //else
                        //{
                        //    double nettotal = Convert.ToDouble(Label5.Text) + Convert.ToDouble(Label6.Text) - Convert.ToDouble(Label7.Text);
                        //    Label10.Text = nettotal.ToString();
                        //}
                        Label10.Text = Label5.Text.ToString();

                        if (!this.IsPostBack)
                        {


                            serverTime = DateTime.Now; // gives you current Time in server timeZone
                            utcTime = serverTime.ToUniversalTime(); // convert it to Utc using timezone setting of server computer

                            tzi = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
                            localTime = TimeZoneInfo.ConvertTimeFromUtc(utcTime, tzi);


                            //DateTime otime = DateTime.Now;
                            Label15.Text = localTime.ToString("h:mm tt");


                            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;


                            using (SqlConnection con = new SqlConnection(constr))
                            {
                                using (SqlCommand cmd1 = new SqlCommand("SELECT Id, Faddress FROM Addresses WHERE Customerid=@Customerid ORDER BY Id DESC"))
                                {
                                    cmd1.Parameters.Add("@Customerid", returnCookie1.Value);
                                    cmd1.CommandType = CommandType.Text;
                                    cmd1.Connection = con;
                                    con.Open();
                                    DropDownList2.DataSource = cmd1.ExecuteReader();
                                    DropDownList2.DataTextField = "Faddress";
                                    DropDownList2.DataValueField = "Id";
                                    DropDownList2.DataBind();
                                    con.Close();
                                }
                            }
                            DropDownList2.Items.Insert(0, new ListItem("--Select Delivery Address--", "0"));

                            try
                            {
                                string contactno, email, name;
                                string str1xy = " SELECT * FROM Customers WHERE Id = @Id";
                                using (SqlConnection connection = new SqlConnection(constring))
                                {
                                    //parametrized query to prevent SQL Injection
                                    SqlCommand command = new SqlCommand(str1xy, connection);
                                    command.Parameters.Add("@Id", returnCookie1.Value);
                                    connection.Open();
                                    SqlDataReader reader = command.ExecuteReader();
                                    reader.Read();
                                    contactno = reader["Contact"].ToString();
                                    email = reader["Email"].ToString();
                                    name = reader["Name"].ToString();
                                    reader.Close();
                                    connection.Close();
                                }

                                Label12.Text = contactno;
                                TextBox2.Text = Label12.Text;

                                Label16.Text = name;
                                TextBox3.Text = Label16.Text;

                                Label17.Text = email;
                                TextBox7.Text = Label17.Text;
                            }
                            catch
                            {

                            }
                        }
                    }
                    catch
                    {
                        Response.Redirect("Error.aspx");
                    }

                }
            }
        }
    }
    protected void Repeater1_ItemDataBound(object sender, RepeaterItemEventArgs e)
    {
        if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
        {

            string strConnString = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            RepeaterItem item = e.Item;

            //Reference the Controls.
            string qty = (item.FindControl("Label9") as Label).Text;
            string price = (item.FindControl("Label8") as Label).Text;

            try
            {
                double quantity = Convert.ToDouble(qty);
                double uprice = Convert.ToDouble(price);

                double netamount = quantity * uprice;

                (item.FindControl("Label11") as Label).Text = netamount.ToString();
            }
            catch
            {

            }



        }


    }
    private string Decrypt(string cipherText)
    {
        string EncryptionKey = "MAKV2SPBNI99212";
        cipherText = cipherText.Replace(" ", "+");
        byte[] cipherBytes = Convert.FromBase64String(cipherText);
        using (Aes encryptor = Aes.Create())
        {
            Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
            encryptor.Key = pdb.GetBytes(32);
            encryptor.IV = pdb.GetBytes(16);
            using (MemoryStream ms = new MemoryStream())
            {
                using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateDecryptor(), CryptoStreamMode.Write))
                {
                    cs.Write(cipherBytes, 0, cipherBytes.Length);
                    cs.Close();
                }
                cipherText = Encoding.Unicode.GetString(ms.ToArray());
            }
        }
        return cipherText;
    }
    protected void Button1_Click(object sender, System.EventArgs e)
    {
        try
        {
            HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con2 = new SqlConnection(constring);
            string query = "Insert into Addresses(Faddress,Landmark,City,Atype,Customerid,State) values(@Faddress,@Landmark@City,@Atype,@Customerid,@State);";
            using (SqlCommand command = new SqlCommand(query, con2))
            {

                command.Parameters.AddWithValue("@Faddress", TextBox4.Text);
                command.Parameters.AddWithValue("@Landmark", TextBox5.Text);
                command.Parameters.AddWithValue("@City", TextBox6.Text);
                command.Parameters.AddWithValue("@City", TextBox1.Text);
                command.Parameters.AddWithValue("@Atype", DropDownList3.SelectedItem.Text);
                command.Parameters.AddWithValue("@Customerid", returnCookie1.Value);

                con2.Open();
                command.ExecuteScalar();
                con2.Close();
            }

            TextBox4.Text = string.Empty;
            TextBox5.Text = string.Empty;
            TextBox6.Text = string.Empty;
            TextBox1.Text = string.Empty;

            DropDownList3.ClearSelection();


            failed.Style.Add("display", "none");
            success2.Style.Add("display", "block");

            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand("SELECT Id, Faddress FROM Addresses WHERE Customerid=@Customerid ORDER BY Id DESC"))
                {
                    cmd.Parameters.Add("@Customerid", returnCookie1.Value);
                    cmd.CommandType = CommandType.Text;
                    cmd.Connection = con;
                    con.Open();
                    DropDownList2.DataSource = cmd.ExecuteReader();
                    DropDownList2.DataTextField = "Faddress";
                    DropDownList2.DataValueField = "Id";
                    DropDownList2.DataBind();
                    con.Close();
                }
            }


        }
        catch
        {
            failed.Style.Add("display", "block");
            success2.Style.Add("display", "none");
        }
    }
    protected void Button2_Click(object sender, System.EventArgs e)
    {
        try
        {
            HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con2 = new SqlConnection(constring);
            string query = "Insert into Addresses(Faddress,Landmark,City,Atype,Customerid,State,Areacode) values(@Faddress,@Landmark,@City,@Atype,@Customerid,@State,@Areacode);";
            using (SqlCommand command = new SqlCommand(query, con2))
            {

                command.Parameters.AddWithValue("@Faddress", TextBox4.Text);
                command.Parameters.AddWithValue("@Landmark", TextBox5.Text);
                command.Parameters.AddWithValue("@City", TextBox6.Text);
                command.Parameters.AddWithValue("@State", TextBox1.Text);
                command.Parameters.AddWithValue("@Atype", DropDownList3.SelectedItem.Text);
                command.Parameters.AddWithValue("@Customerid", returnCookie1.Value);
                command.Parameters.AddWithValue("@Areacode", TextBox10.Text);
                con2.Open();
                command.ExecuteScalar();
                con2.Close();
            }

            TextBox4.Text = string.Empty;
            TextBox5.Text = string.Empty;
            TextBox6.Text = string.Empty;
            TextBox1.Text = string.Empty;
            TextBox10.Text = string.Empty;
            DropDownList3.ClearSelection();


            failed.Style.Add("display", "none");
            success2.Style.Add("display", "block");

            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con = new SqlConnection(constr))
            {
                using (SqlCommand cmd = new SqlCommand("SELECT Id, Faddress FROM Addresses WHERE Customerid=@Customerid ORDER BY Id DESC"))
                {
                    cmd.Parameters.Add("@Customerid", returnCookie1.Value);
                    cmd.CommandType = CommandType.Text;
                    cmd.Connection = con;
                    con.Open();
                    DropDownList2.DataSource = cmd.ExecuteReader();
                    DropDownList2.DataTextField = "Faddress";
                    DropDownList2.DataValueField = "Id";
                    DropDownList2.DataBind();
                    con.Close();
                }
            }


        }
        catch
        {
            failed.Style.Add("display", "block");
            success2.Style.Add("display", "none");
        }
    }
    protected void Button5_Click(object sender, System.EventArgs e)
    {
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection con = new SqlConnection(constring);
        SqlCommand cmd = new SqlCommand("Select Email from Newsletters where Email= @Email", con);
        cmd.Parameters.AddWithValue("@Email", TextBox1.Text);
        con.Open();
        SqlDataReader dr = cmd.ExecuteReader();
        if (dr.Read())
        {
            if (dr.HasRows == true)
            {
                con.Close();

                Response.Write("<script>alert('You have already subscribed to newsletter services.')</script>");

            }
        }
        else
        {
            con.Close();
            try
            {
                string query = "Insert into Newsletters(Email) values(@Email)";
                using (SqlCommand command = new SqlCommand(query, con))
                {
                    command.Parameters.AddWithValue("@Email", TextBox1.Text);
                    con.Open();
                    int NewId = Convert.ToInt32(command.ExecuteScalar());
                    con.Close();



                    TextBox1.Text = string.Empty;

                    Response.Write("<script>alert('Great! Your subscription was successfull. Thanks for your interest in our Newsletter services.')</script>");
                }
            }
            catch
            {
                Response.Write("<script>alert('Sorry some error occoured, Please try again later!')</script>");
            }
        }
    }
    protected void Button6_Click(object sender, System.EventArgs e)
    {
        Response.Redirect("Search.aspx");
    }
    protected void Button3_Click(object sender, System.EventArgs e)
    {
        if (DropDownList2.SelectedItem.Value == "0")
        {
            Response.Write("<script>alert('Please select a valid address & Try Again!')</script>");
        }
        else
        {

            HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con1 = new SqlConnection(constr))
            {
                con1.Open();
                SqlCommand cmd1 = new SqlCommand("update Customers set Contact=@Contact, Name=@Name, Email=@Email WHERE Id=@Id", con1);
                cmd1.Parameters.AddWithValue("@Id", returnCookie1.Value);
                cmd1.Parameters.AddWithValue("@Contact", Label12.Text);
                cmd1.Parameters.AddWithValue("@Name", Label16.Text);
                cmd1.Parameters.AddWithValue("@Email", Label17.Text);
                cmd1.ExecuteNonQuery();
                con1.Close();
            }

            int NewId = 0;
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con = new SqlConnection(constring);
            string query = "Insert into Transactions(Dated,Orderid,Customerid,Subtotal,Deliverytype,Nettotal,Paymentstatus,Paymenttype,Referenceno,Addressid) values(@Dated,@Orderid,@Customerid,@Subtotal,@Deliverytype,@Nettotal,@Paymentstatus,@Paymenttype,@Referenceno,@Addressid);SELECT CAST(scope_identity() AS int);";
            using (SqlCommand command = new SqlCommand(query, con))
            {
                command.Parameters.AddWithValue("@Dated", DateTime.Now.AddMinutes(750).ToString());
                command.Parameters.AddWithValue("@Orderid", Label2.Text);
                command.Parameters.AddWithValue("@Customerid", returnCookie1.Value);
                command.Parameters.AddWithValue("@Subtotal", Label5.Text);
                command.Parameters.AddWithValue("@Deliverytype", "Standard");
                command.Parameters.AddWithValue("@Nettotal", Label10.Text);
                command.Parameters.AddWithValue("@Paymentstatus", "PENDING");
                command.Parameters.AddWithValue("@Paymenttype", "Online");
                command.Parameters.AddWithValue("@Referenceno", "PENDING");
                command.Parameters.AddWithValue("@Addressid", DropDownList2.SelectedItem.Value);


                con.Open();
                NewId = Convert.ToInt32(command.ExecuteScalar());
                con.Close();
            }

            string tid = NewId.ToString();

            Response.Redirect("Stripe/Default.aspx?Email=" + Label17.Text + "&oid=" + tid);


        }


    }
    protected void Button4_Click(object sender, System.EventArgs e)
    {

        if (DropDownList2.SelectedItem.Value == "0")
        {
            Response.Write("<script>alert('Please select a valid address & Try Again!')</script>");
        }
        else
        {
            HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con1 = new SqlConnection(constr))
            {
                con1.Open();
                SqlCommand cmd1 = new SqlCommand("update Customers set Contact=@Contact, Name=@Name, Email=@Email WHERE Id=@Id", con1);
                cmd1.Parameters.AddWithValue("@Id", returnCookie1.Value);
                cmd1.Parameters.AddWithValue("@Contact", Label12.Text);
                cmd1.Parameters.AddWithValue("@Name", Label16.Text);
                cmd1.Parameters.AddWithValue("@Email", Label17.Text);
                cmd1.ExecuteNonQuery();
                con1.Close();
            }

            int NewId = 0;
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con = new SqlConnection(constring);
            string query = "Insert into Transactions(Dated,Orderid,Customerid,Subtotal,Deliverytype,Nettotal,Paymentstatus,Paymenttype,Referenceno,Addressid) values(@Dated,@Orderid,@Customerid,@Subtotal,@Deliverytype,@Nettotal,@Paymentstatus,@Paymenttype,@Referenceno,@Addressid);SELECT CAST(scope_identity() AS int);";
            using (SqlCommand command = new SqlCommand(query, con))
            {
                command.Parameters.AddWithValue("@Dated", DateTime.Now.AddMinutes(750).ToString());
                command.Parameters.AddWithValue("@Orderid", Label2.Text);
                command.Parameters.AddWithValue("@Customerid", returnCookie1.Value);
                command.Parameters.AddWithValue("@Subtotal", Label5.Text);

                command.Parameters.AddWithValue("@Deliverytype", "Standard");

                command.Parameters.AddWithValue("@Nettotal", Label10.Text);
                command.Parameters.AddWithValue("@Paymentstatus", "PENDING");
                command.Parameters.AddWithValue("@Paymenttype", "COD");
                command.Parameters.AddWithValue("@Referenceno", "NOT APPLICABLE");
                command.Parameters.AddWithValue("@Addressid", DropDownList2.SelectedItem.Value);


                con.Open();
                NewId = Convert.ToInt32(command.ExecuteScalar());
                con.Close();
            }

            string tid = NewId.ToString();
            Response.Redirect("Order.aspx?tid=" + HttpUtility.UrlEncode(Encrypt(tid)));
        }





    }
    private string Encrypt(string clearText)
    {
        string EncryptionKey = "MAKV2SPBNI99212";
        byte[] clearBytes = Encoding.Unicode.GetBytes(clearText);
        using (Aes encryptor = Aes.Create())
        {
            Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
            encryptor.Key = pdb.GetBytes(32);
            encryptor.IV = pdb.GetBytes(16);
            using (MemoryStream ms = new MemoryStream())
            {
                using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateEncryptor(), CryptoStreamMode.Write))
                {
                    cs.Write(clearBytes, 0, clearBytes.Length);
                    cs.Close();
                }
                clearText = Convert.ToBase64String(ms.ToArray());
            }
        }
        return clearText;
    }
    protected void TextBox2_TextChanged(object sender, System.EventArgs e)
    {
        Label12.Text = TextBox2.Text;
    }

    protected void TextBox3_TextChanged(object sender, EventArgs e)
    {
        Label16.Text = TextBox3.Text;
    }

    protected void TextBox7_TextChanged(object sender, EventArgs e)
    {
        Label17.Text = TextBox7.Text;
    }

    protected void OnItemDataBound(object sender, RepeaterItemEventArgs e)
    {
        if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
        {
            string customerId = (e.Item.FindControl("hfCustomerId") as HiddenField).Value;
            Repeater rptOrders = e.Item.FindControl("rptOrders") as Repeater;
            rptOrders.DataSource = GetData(string.Format("SELECT * FROM Subcategory WHERE Categoryid='{0}'", customerId));
            rptOrders.DataBind();
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


    protected void A1_Click(object sender, System.EventArgs e)
    {
        HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
        if ((returnCookie1 == null) || string.IsNullOrEmpty(returnCookie1.Value))
        {
            Response.Redirect("Login.aspx");
        }
        else
        {
            Response.Cookies["mydealloscookie2"].Expires = DateTime.Now.AddDays(-1);
            Session.Abandon();
            Response.Redirect("Login.aspx");
        }
    }

    protected void Repeater3_ItemDataBound(object sender, RepeaterItemEventArgs e)
    {
        if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
        {
            string customerId = (e.Item.FindControl("hfCustomerId") as HiddenField).Value;
            Repeater rptOrders = e.Item.FindControl("rptOrders") as Repeater;
            rptOrders.DataSource = GetData(string.Format("SELECT * FROM Subcategory WHERE Categoryid='{0}'", customerId));
            rptOrders.DataBind();
        }
    }




    protected void Button5_Click1(object sender, EventArgs e)
    {
        try
        {
            HttpCookie returnCookie1 = Request.Cookies["mydealloscookie2"];
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;

            int NewId = 0;
            string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            SqlConnection con = new SqlConnection(constring);
            string query = "Insert into Transactions(Dated,Orderid,Customerid,Subtotal,Deliverytype,Nettotal,Paymentstatus,Status,Appointmentdate,Email,Name,Contact,Addressid) values(@Dated,@Orderid,@Customerid,@Subtotal,@Deliverytype,@Nettotal,@Paymentstatus,@Status,@Appointmentdate,@Email,@Name,@Contact,@Addressid);SELECT CAST(scope_identity() AS int);";
            using (SqlCommand command = new SqlCommand(query, con))
            {
                command.Parameters.AddWithValue("@Dated", DateTime.Now.AddMinutes(750).ToString());
                command.Parameters.AddWithValue("@Orderid", Label2.Text);
                command.Parameters.AddWithValue("@Customerid", returnCookie1.Value);
                command.Parameters.AddWithValue("@Subtotal", Label7.Text);

                command.Parameters.AddWithValue("@Deliverytype", "Appointments");
                command.Parameters.AddWithValue("@Status", "Appointment Request");
                command.Parameters.AddWithValue("@Appointmentdate", TextBox12.Text);
                command.Parameters.AddWithValue("@Email", TextBox11.Text);
                command.Parameters.AddWithValue("@Name", TextBox9.Text);
                command.Parameters.AddWithValue("@Contact", TextBox8.Text);
                command.Parameters.AddWithValue("@Nettotal", Label13.Text);
                command.Parameters.AddWithValue("@Paymentstatus", "PENDING");
                command.Parameters.AddWithValue("@Addressid", DropDownList4.SelectedItem.Text);


                con.Open();
                NewId = Convert.ToInt32(command.ExecuteScalar());
                con.Close();
            }

            string tid = NewId.ToString();
            Response.Redirect("Order.aspx?tid=" + HttpUtility.UrlEncode(Encrypt(tid)));
        }
        catch {
        
        }

    }
}

