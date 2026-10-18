import os
import psycopg2
from pathlib import Path

def get_db_url():
    env_file = Path('.env')
    if not env_file.exists():
        raise FileNotFoundError('.env file not found')
    for line in env_file.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if line.startswith('DIRECT_URL='):
            return line.split('=', 1)[1].strip('"\'')
        if line.startswith('DATABASE_URL=') and 'DIRECT_URL' not in locals():
            db_url = line.split('=', 1)[1].strip('"\'')
    return db_url

def main():
    url = get_db_url()
    conn = psycopg2.connect(url)
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
    rows = cur.fetchall()
    print("Tables in public schema:", len(rows))
    for r in rows:
        print(" -", r[0])
    cur.close()
    conn.close()

if __name__ == '__main__':
    main()
