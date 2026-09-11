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
using ShoppingCartExample;
using System.Data.SqlClient;
using System.IO;
using System.Web.Script.Serialization;
using System.Security.Cryptography;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;
public partial class CartControl : System.Web.UI.UserControl
{
    protected void Page_Load(object sender, EventArgs e)
    {

        if (Profile.SCart == null)
        {
            Profile.SCart = new ShoppingCartExample.Cart();
        }

        if (!Page.IsPostBack)
        {
            ReBindGrid();
            if (TotalLabel.Text == "0")
            {
                ordercontinue.Style.Add("display", "none");
            }
        }
        if (Profile.SCart.Items == null)
        {
            TotalLabel.Visible = false;
        }


    }
    [System.Web.Script.Services.ScriptMethod()]
    [System.Web.Services.WebMethod]



    private void ReBindGrid()
    {
        grdCart.DataSource = Profile.SCart.Items;
        DataBind();
        TotalLabel.Text = Profile.SCart.Total.ToString();
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
    private DataTable GetData11(string query)
    {
        string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        using (SqlConnection con = new SqlConnection(constr))
        {
            using (SqlCommand cmd = new SqlCommand(query, con))
            {
                using (SqlDataAdapter sda = new SqlDataAdapter(cmd))
                {
                    DataTable dt = new DataTable();
                    sda.Fill(dt);
                    return dt;
                }
            }
        }
    }
    protected void Button5_Click(object sender, System.EventArgs e)
    {
        RepeaterItem item = (sender as Button).NamingContainer as RepeaterItem;

        double Price = Convert.ToDouble((item.FindControl("Label1yy") as Label).Text);
        string ProductName = (item.FindControl("Label6") as Label).Text;
        string Deliverytype = "";
        string ProductImageUrl = (item.FindControl("Label7") as Label).Text;

        int ProductID = int.Parse((item.FindControl("Label4") as Label).Text);
        int quantity = int.Parse((item.FindControl("TextBox1") as TextBox).Text);


        if (Profile.SCart == null)
        {
            Profile.SCart = new ShoppingCartExample.Cart();
        }

        Profile.SCart.Insert(ProductID, Price, quantity, ProductName, ProductImageUrl, Deliverytype);

        Response.Redirect(Request.RawUrl);
    }
    protected void grdCart_RowDeleting(object sender, System.Web.UI.WebControls.GridViewDeleteEventArgs e)
    {
        Profile.SCart.Items.RemoveAt(e.RowIndex);
        ReBindGrid();
        Response.Redirect(Request.RawUrl);
    }
    protected void Button1_Click(object sender, System.EventArgs e)
    {
        int newID;
        string constring = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        SqlConnection con = new SqlConnection(constring);
        string query3 = "Insert into Orders(Total,Status,Dated) values(@Total,@Status,@Dated);SELECT CAST(scope_identity() AS int)";
        using (SqlCommand command = new SqlCommand(query3, con))
        {
            command.Parameters.AddWithValue("@Total", TotalLabel.Text);
            command.Parameters.AddWithValue("@Status", "Pending");
            command.Parameters.AddWithValue("@Dated", DateTime.Now.ToString());
            con.Open();
            newID = (int)command.ExecuteScalar();
            con.Close();
        }

        DataTable dt = new DataTable();
        dt.Columns.Add("coursename", typeof(string));
        dt.Columns.Add("coursetotal", typeof(string));
        dt.Columns.Add("scheduleid", typeof(string));
        dt.Columns.Add("orderid", typeof(string));
        dt.Columns.Add("quantity", typeof(string));
        dt.Columns.Add("payment", typeof(string));
        foreach (GridViewRow gvrow in grdCart.Rows)
        {

            Label MyLabel1 = (Label)gvrow.FindControl("Label66");
            Label MyLabel2 = (Label)gvrow.FindControl("Label333");
            Label MyLabel3 = (Label)gvrow.FindControl("Label2");
            TextBox MyLabel4 = (TextBox)gvrow.FindControl("TextBox1");
            Label MyLabel6 = (Label)gvrow.FindControl("Label6");

            string coursename = MyLabel1.Text;
            string coursetotal = MyLabel2.Text;
            string scheduleid = MyLabel3.Text;
            string quantity = MyLabel4.Text;
            string corderid = newID.ToString();
            string payment = MyLabel6.Text;

            dt.Rows.Add(coursename, coursetotal, scheduleid, corderid, quantity, payment);
        }
        string constring1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
        using (SqlConnection con1 = new SqlConnection(constring1))
        {
            con1.Open();
            SqlBulkCopy sqlBulk = new SqlBulkCopy(constring1);
            sqlBulk.DestinationTableName = "Orderssub";
            sqlBulk.WriteToServer(dt);
            con.Close();
        }
        Response.Redirect("Checkout.aspx?oid=" + HttpUtility.UrlEncode(Encrypt(newID.ToString())));
           
    }
    protected void Btn1_Click(object sender, EventArgs e)
    {
        LinkButton btn = (LinkButton)sender;
        GridViewRow row = (GridViewRow)btn.NamingContainer;

        //Fetch value of Name.
        string counter = (row.FindControl("TextBox1") as TextBox).Text;

        int finalcount = 0;
        int currentcount = Convert.ToInt32(counter);
        int newcount = currentcount - 1;
        if (newcount <= 0)
        {
            finalcount = 1;
        }
        else
        {
            finalcount = newcount;
        }

        TextBox ua = (TextBox)row.FindControl("TextBox1");
        ua.Text = finalcount.ToString();

        double units = Convert.ToDouble(ua.Text);

        Label pa = (Label)row.FindControl("Label8");
        double price = Convert.ToDouble(pa.Text);

        double subtotal = units * price;

        Label sa = (Label)row.FindControl("Label11");
        sa.Text = subtotal.ToString();

        float total = 0;
        foreach (GridViewRow gridViewRow in grdCart.Rows)
        {

            Label lbltotalnet = (Label)gridViewRow.FindControl("Label11");

            float rowValue = 0;
            if (float.TryParse(lbltotalnet.Text.Trim(), out rowValue))
                total += rowValue;
        }

        TotalLabel.Text = total.ToString();
    }
    protected void Btn2_Click(object sender, EventArgs e)
    {
        LinkButton btn = (LinkButton)sender;
        GridViewRow row = (GridViewRow)btn.NamingContainer;

        //Fetch value of Name.
        string counter = (row.FindControl("TextBox1") as TextBox).Text;

        int finalcount = 0;
        int currentcount = Convert.ToInt32(counter);
        int newcount = currentcount + 1;
        finalcount = newcount;

        TextBox ua = (TextBox)row.FindControl("TextBox1");
        ua.Text = finalcount.ToString();

        double units = Convert.ToDouble(ua.Text);

        Label pa = (Label)row.FindControl("Label8");
        double price = Convert.ToDouble(pa.Text);

        double subtotal = units * price;

        Label sa = (Label)row.FindControl("Label11");
        sa.Text = subtotal.ToString();

        float total = 0;
        foreach (GridViewRow gridViewRow in grdCart.Rows)
        {

            Label lbltotalnet = (Label)gridViewRow.FindControl("Label11");

            float rowValue = 0;
            if (float.TryParse(lbltotalnet.Text.Trim(), out rowValue))
                total += rowValue;
        }

        TotalLabel.Text = total.ToString();
    }
}
