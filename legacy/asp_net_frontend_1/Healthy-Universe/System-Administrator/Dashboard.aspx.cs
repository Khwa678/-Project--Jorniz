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

public partial class System_Administrator_Dashboard : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!this.IsPostBack)
        {
            SqlConnection con1 = new SqlConnection(ConfigurationManager.ConnectionStrings["constr"].ConnectionString);
            con1.Open();
            SqlCommand cmd1 = new SqlCommand("select count(Id) from Parentcategory", con1);
            Int32 count1 = (Int32)cmd1.ExecuteScalar();
            con1.Close();
            Label8.Text = count1.ToString();

            con1.Open();
            SqlCommand cmd2 = new SqlCommand("select count(Id) from Subcategory", con1);
            Int32 count2 = (Int32)cmd2.ExecuteScalar();
            con1.Close();
            Label9.Text = count2.ToString();

            con1.Open();
            SqlCommand cmd3 = new SqlCommand("select count(Id) from Servicecategory", con1);
            Int32 count3 = (Int32)cmd3.ExecuteScalar();
            con1.Close();
            Label10.Text = count3.ToString();

            con1.Open();
            SqlCommand cmd4 = new SqlCommand("select count(Id) from Doctors", con1);
            Int32 count4 = (Int32)cmd4.ExecuteScalar();
            con1.Close();
            Label4.Text = count4.ToString();

            con1.Open();
            SqlCommand cmd5 = new SqlCommand("select count(Id) from Products", con1);
            Int32 count5 = (Int32)cmd5.ExecuteScalar();
            con1.Close();
            Label6.Text = count5.ToString();

            con1.Open();
            SqlCommand cmd6 = new SqlCommand("select count(Id) from Lastcategory", con1);
            Int32 count6 = (Int32)cmd6.ExecuteScalar();
            con1.Close();
            Label11.Text = count6.ToString();

            con1.Open();
            SqlCommand cmd7 = new SqlCommand("select count(Id) from Sproviders", con1);
            Int32 count7 = (Int32)cmd7.ExecuteScalar();
            con1.Close();
            Label3.Text = count7.ToString();

            con1.Open();
            SqlCommand cmd8 = new SqlCommand("select count(Id) from Sproviders Where Status = @Status", con1);
            cmd8.Parameters.Add("@Status","PENDING");
            Int32 count8 = (Int32)cmd8.ExecuteScalar();
            con1.Close();
            Label13.Text = count8.ToString();

            con1.Open();
            SqlCommand cmd9 = new SqlCommand("select count(Id) from Tests Where Status = @Status", con1);
            cmd9.Parameters.Add("@Status", "PENDING");
            Int32 count9 = (Int32)cmd9.ExecuteScalar();
            con1.Close();
            Label12.Text = count9.ToString();
        }
    }
   
}