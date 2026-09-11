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

public partial class Order : System.Web.UI.Page
{
    string oid = string.Empty;
    protected void Page_Load(object sender, EventArgs e)
    {


        try
        {
            string tid = Decrypt(HttpUtility.UrlDecode(Request.QueryString["tid"]));
            //string tid = Decrypt(HttpUtility.UrlDecode("Czi%2bIvhTsckdy3wWbE8z3g%3d%3d"));
            Profile.SCart = null;
            Profile.SCart = new ShoppingCartExample.Cart();


            string nett, cid, edel, aid, dtype;
            string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            string str1 = " SELECT * FROM Transactions WHERE Id = @Id";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1, connection);
                command.Parameters.Add("@Id", tid);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();
                oid = reader["Orderid"].ToString();
                nett = reader["Nettotal"].ToString();
                cid = reader["Customerid"].ToString();
                edel = reader["Edel"].ToString();
                aid = reader["Addressid"].ToString();
                dtype = reader["Deliverytype"].ToString();
                reader.Close();
                connection.Close();
            }

            Label3.Text = oid;
            Label1.Text = tid;
            Label2.Text = nett;


            string cname, ccontact, cemail;
            string str123 = " SELECT * FROM Customers WHERE Id = @Id";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str123, connection);
                command.Parameters.Add("@Id", cid);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();

                cname = reader["Name"].ToString();
                ccontact = reader["Contact"].ToString();
                cemail = reader["Email"].ToString();

                reader.Close();
                connection.Close();
            }


            string aa, bb, cc, dd;
            string str1234 = " SELECT * FROM Addresses WHERE Id = @Id";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1234, connection);
                command.Parameters.Add("@Id", aid);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();

                aa = reader["Faddress"].ToString();
                bb = reader["Area"].ToString();
                cc = reader["City"].ToString();
                dd = reader["State"].ToString();

                reader.Close();
                connection.Close();
            }

            if (!Page.IsPostBack)
            {
                ReBindGrid();

                string order = string.Empty;

                try
                {
                    using (StringWriter sw = new StringWriter())
                    {
                        using (HtmlTextWriter hw = new HtmlTextWriter(sw))
                        {
                            grdCart.RenderControl(hw);
                            StringReader sr = new StringReader(sw.ToString());
                            order = sw.ToString();
                        }
                    }
                }
                catch
                {

                }

            }




            try
            {
                HttpCookie returnCookie = Request.Cookies["afcookie"];
                if ((returnCookie == null) || string.IsNullOrEmpty(returnCookie.Value))
                {

                }
                else
                {
                    HttpCookie deleteCookie = new HttpCookie("afcookie");
                    deleteCookie.Expires = DateTime.Now.AddDays(-1);
                    Response.Cookies.Add(deleteCookie);
                }
            }
            catch
            {

            }


        }
        catch
        {
            Response.Redirect("Error.aspx");
        }
    }
    public static string GetResponse(string sURL)
    {
        HttpWebRequest request = (HttpWebRequest)WebRequest.Create(sURL);
        request.MaximumAutomaticRedirections = 4;
        request.Credentials = CredentialCache.DefaultCredentials;
        try
        {
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            Stream receiveStream = response.GetResponseStream();
            StreamReader readStream = new StreamReader(receiveStream, Encoding.UTF8);
            string sResponse = readStream.ReadToEnd();
            response.Close();
            readStream.Close();
            return sResponse;
        }
        catch (Exception ex)
        {
            return ex.ToString();
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

    protected void Button5_Click(object sender, System.EventArgs e)
    {
        Response.Redirect("My-Account.aspx");
    }
    protected void Button6_Click(object sender, System.EventArgs e)
    {
        Response.Redirect("My-Orders.aspx");
    }
    private void ReBindGrid()
    {
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
        grdCart.DataSource = ds.Tables[0];
        grdCart.DataBind();
        conn.Close();
    }
}