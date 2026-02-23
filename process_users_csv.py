import csv

input_file = 'User_Download_08022026_231300.csv'
output_file = 'supabase/migrations/seed_users.sql'

def get_role(email):
    # Logic to determine role. For now, everyone is 'teacher' except known admins?
    # Or just default to teacher as safe bet.
    if 'director' in email:
        return 'director'
    if 'utp' in email:
        return 'utp'
    return 'teacher'

with open(input_file, mode='r', encoding='utf-8') as infile, open(output_file, mode='w', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    
    outfile.write("-- Seeding authorized_users from CSV\n")
    outfile.write("INSERT INTO public.authorized_users (email, full_name, role, status) VALUES\n")
    
    values = []
    for row in reader:
        email = row['Email Address [Required]'].strip()
        first_name = row['First Name [Required]'].strip()
        last_name = row['Last Name [Required]'].strip()
        full_name = f"{first_name} {last_name}".replace("'", "''") # Escape quotes
        status = 'active' if row['Status [READ ONLY]'] == 'Active' else 'suspended'
        role = get_role(email)
        
        values.append(f"('{email}', '{full_name}', '{role}', '{status}')")
    
    outfile.write(",\n".join(values))
    outfile.write("\nON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, status = EXCLUDED.status;\n")

print(f"Generated SQL seed file at {output_file}")
