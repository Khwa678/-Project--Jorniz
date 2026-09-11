using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;

public partial class System_Administrator_Security : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

        if (!this.IsPostBack)
        {
            error.Style.Add("display", "none");
            success.Style.Add("display", "none");

            string fname = string.Empty;
            string lname = string.Empty;
            string email = string.Empty;
            string password = string.Empty;
            string contact = string.Empty;

            string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            string str1 = " SELECT * FROM Login WHERE Id = @Id";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1, connection);
                command.Parameters.Add("@Id", "1");
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();

               
                email = reader["Username"].ToString();
                password = reader["Password"].ToString();
              
                Label3.Text = email;
                Label4.Text = password;
          

               
                TextBox3.Text = email;
                TextBox4.Text = password;
           

                reader.Close();
                connection.Close();
            }
        }

    }

    
    protected void TextBox3_TextChanged(object sender, EventArgs e)
    {
            Label3.Text = TextBox3.Text;
    }

    protected void TextBox4_TextChanged(object sender, EventArgs e)
    {
        Label4.Text = TextBox4.Text;
    }


    protected void Button1_Click(object sender, EventArgs e)
    {
        try
        {
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con1 = new SqlConnection(constr))
            {
                con1.Open();
                SqlCommand cmd1 = new SqlCommand("update Login set Username=@Username, Password=@Password WHERE Id=@Id", con1);
                cmd1.Parameters.AddWithValue("@Id", "1");
                cmd1.Parameters.AddWithValue("@Username", Label3.Text);
                cmd1.Parameters.AddWithValue("@Password", Label4.Text);
                cmd1.ExecuteNonQuery();
                con1.Close();
            }


          
            TextBox3.Text = Label3.Text;
            TextBox4.Text = Label4.Text;
           
            Button1.Enabled = false;



            error.Style.Add("display", "none");
            success.Style.Add("display", "inline-block");
        }
        catch
        {
            error.Style.Add("display", "inline-block");
            success.Style.Add("display", "none");
        }
    }
}