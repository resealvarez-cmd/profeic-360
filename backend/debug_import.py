import os
from dotenv import load_dotenv
load_dotenv()

print("Importing simce_router...")
try:
    import simce_router
    print("simce_router imported successfully")
except Exception as e:
    print(f"Error importing simce_router: {e}")

print("Importing main...")
try:
    import main
    print("main imported successfully")
except Exception as e:
    print(f"Error importing main: {e}")
