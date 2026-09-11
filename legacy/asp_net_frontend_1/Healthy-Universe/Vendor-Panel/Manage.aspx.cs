using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;

public partial class Vendor_Panel_Manage : System.Web.UI.Page
{

    protected void Page_Load(object sender, EventArgs e)
    {
        error.Style.Add("display", "none");
        success.Style.Add("display", "none");


        if (!this.IsPostBack)
        {

            HttpCookie returnCookie1x = Request.Cookies["mygoacookie1"];
            string Memberinfo;
            string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            string str1 = "SELECT * FROM Sproviders WHERE Email = @Email";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1, connection);
                command.Parameters.Add("@Email", returnCookie1x.Value);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();
                Memberinfo = reader["Id"].ToString();
                Label24.Text = reader["id"].ToString();

                reader.Close();
                connection.Close();
            }

            string Name = string.Empty;
            string Email = string.Empty;
            string Contact = string.Empty;
            string Businessname = string.Empty;
            string Description = string.Empty;
            string Address = string.Empty;
            string City = string.Empty;

            string State = string.Empty;
            string Gstin = string.Empty;
            string Panno = string.Empty;
            string Servicesname = string.Empty;
            string Password = string.Empty;
          

            string str1x = " SELECT * FROM Sproviders WHERE Id = @Id";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1x, connection);
                command.Parameters.Add("@Id", Memberinfo);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();


                Name = reader["Name"].ToString();
                Email = reader["Email"].ToString();
                Contact = reader["Contact"].ToString();
                Businessname = reader["Businessname"].ToString();
                Description = reader["Description"].ToString();
                Address = reader["Address"].ToString();
                City = reader["City"].ToString();
                State = reader["State"].ToString();
                Gstin = reader["Gstin"].ToString();
                Panno = reader["Panno"].ToString();            
                Password = reader["Password"].ToString();
           
                Label1.Text = Name;
                Label2.Text = Email;

                Label3.Text = Contact;
                Label4.Text = Businessname;
                Label5.Text = Description;
                Label6.Text = Address;
                Label7.Text = City;

                Label8.Text = State;
              
                Label9.Text = Gstin;
                Label10.Text = Panno;
             
                Label12.Text = Password;

         
                TextBox1.Text = Name;
                TextBox2.Text = Email;

                TextBox3.Text = Contact;
                TextBox4.Text = Businessname;
                TextBox5.Text = Description;
              
                TextBox6.Text = City;
                TextBox7.Text = State;
                TextBox8.Text = Address;
                TextBox9.Text = Gstin;
                TextBox10.Text = Panno;
            
                TextBox12.Text = Password;

            


                reader.Close();
                connection.Close();
            }
        }

    }


    protected void Button1_Click(object sender, EventArgs e)
    {
        try
        {
            HttpCookie returnCookie1x = Request.Cookies["mygoacookie1"];
            string Id;
            string strConnString1 = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            string str1 = " SELECT * FROM Sproviders WHERE Email = @Email";
            using (SqlConnection connection = new SqlConnection(strConnString1))
            {
                //parametrized query to prevent SQL Injection
                SqlCommand command = new SqlCommand(str1, connection);
                command.Parameters.Add("@Email", returnCookie1x.Value);
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();
                reader.Read();

                Id = reader["Id"].ToString();


                reader.Close();
                connection.Close();
            }
           
            string constr = ConfigurationManager.ConnectionStrings["constr"].ConnectionString;
            using (SqlConnection con1 = new SqlConnection(constr))
            {
                con1.Open();
                SqlCommand cmd1 = new SqlCommand("update Sproviders SET Name=@Name, Email=@Email, Contact=@Contact, Businessname=@Businessname, Description=@Description, Address=@Address, City=@City, State=@State, Gstin=@Gstin, Panno=@Panno, Password=@Password WHERE Id=@Id", con1);
                cmd1.Parameters.AddWithValue("@Id", Id);
                cmd1.Parameters.AddWithValue("@Name", Label1.Text);
                cmd1.Parameters.AddWithValue("@Email", Label2.Text);
                cmd1.Parameters.AddWithValue("@Contact", Label3.Text);
                cmd1.Parameters.AddWithValue("@Businessname", Label4.Text);
                cmd1.Parameters.AddWithValue("@Description", Label5.Text);
                cmd1.Parameters.AddWithValue("@Address", Label6.Text);
                cmd1.Parameters.AddWithValue("@City", Label7.Text);             
                cmd1.Parameters.AddWithValue("@State", Label8.Text);
                cmd1.Parameters.AddWithValue("@Gstin", Label9.Text);
                cmd1.Parameters.AddWithValue("@Panno", Label10.Text);
             
                cmd1.Parameters.AddWithValue("@Password", Label12.Text);
               

                cmd1.ExecuteNonQuery();
                con1.Close();
            }


            TextBox1.Text = Label1.Text;
            TextBox2.Text = Label2.Text;

            TextBox3.Text = Label3.Text;
            TextBox4.Text = Label4.Text;

            TextBox5.Text = Label5.Text;
            TextBox6.Text = Label6.Text;
   
            TextBox8.Text = Label8.Text;
            TextBox9.Text = Label9.Text;

            TextBox10.Text = Label10.Text;
         
            TextBox12.Text = Label12.Text;
           


            error.Style.Add("display", "none");
            success.Style.Add("display", "inline-block");
        }
        catch
        {
            error.Style.Add("display", "inline-block");
            success.Style.Add("display", "none");
        }
    }




    protected void TextBox1_TextChanged(object sender, EventArgs e)
    {
        Label1.Text = TextBox1.Text;
    }

    protected void TextBox2_TextChanged(object sender, EventArgs e)
    {
        Label2.Text = TextBox2.Text;
    }

    protected void TextBox3_TextChanged(object sender, EventArgs e)
    {
        Label3.Text = TextBox3.Text;
    }

    protected void TextBox4_TextChanged(object sender, EventArgs e)
    {
        Label4.Text = TextBox4.Text;
    }

    protected void TextBox5_TextChanged(object sender, EventArgs e)
    {
        Label5.Text = TextBox5.Text;
    }

    protected void TextBox6_TextChanged(object sender, EventArgs e)
    {
        Label6.Text = TextBox6.Text;
    }
 

    protected void TextBox9_TextChanged(object sender, EventArgs e)
    {
        Label9.Text = TextBox9.Text;
    }


    protected void TextBox10_TextChanged(object sender, EventArgs e)
    {
        Label10.Text = TextBox10.Text;
    }

    protected void TextBox12_TextChanged(object sender, EventArgs e)
    {
        Label12.Text = TextBox12.Text;
    }

    protected void TextBox7_TextChanged(object sender, EventArgs e)
    {
        Label7.Text = TextBox7.Text;
    }



    protected void TextBox8_TextChanged(object sender, EventArgs e)
    {
        Label8.Text = TextBox8.Text;
    }


}