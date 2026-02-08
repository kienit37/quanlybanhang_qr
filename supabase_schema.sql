-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";
-- 2. Create Categories table
create table categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    "order" integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
-- 3. Create Products table
create table products (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    price numeric not null,
    description text,
    image text,
    category text,
    -- Can be category name or ID
    available boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
-- 4. Create Tables table
create table tables (
    id text primary key,
    -- Use text to match existing logic (e.g. "1", "2")
    name text not null,
    is_occupied boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
-- 5. Create Staff table
create table staff (
    id uuid primary key default uuid_generate_v4(),
    username text unique not null,
    password text not null default '123',
    -- Default pass for demo
    role text check (role in ('ADMIN', 'STAFF')),
    name text not null,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
-- 6. Create Orders table
create table orders (
    id uuid primary key default uuid_generate_v4(),
    table_id text not null,
    customer_name text not null,
    total_amount numeric not null,
    status text check (
        status in (
            'PENDING',
            'CONFIRMED',
            'PREPARING',
            'COMPLETED',
            'CANCELLED'
        )
    ),
    created_at timestamp with time zone default timezone('utc'::text, now())
);
-- 7. Create Order Items table
create table order_items (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid references orders(id) on delete cascade,
    product_id text,
    name text not null,
    price numeric not null,
    quantity integer not null,
    note text,
    category text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
-- 8. Create Settings table
create table settings (
    id text primary key default 'system',
    restaurant_name text,
    address text,
    phone text,
    wifi_pass text,
    tax_rate numeric,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);
-- 9. Create Logs table
create table logs (
    id uuid primary key default uuid_generate_v4(),
    action text not null,
    details text,
    "user" text not null,
    timestamp timestamp with time zone default timezone('utc'::text, now())
);
-- 10. Initial Data
insert into settings (
        id,
        restaurant_name,
        address,
        phone,
        wifi_pass,
        tax_rate
    )
values (
        'system',
        'Nhà Hàng QR Dine',
        '123 Đường ABC, Quận 1, TP.HCM',
        '0909 123 456',
        '88888888',
        8
    );
insert into categories (name, "order")
values ('Khai Vị', 0),
    ('Món Chính', 1),
    ('Đồ Uống', 2),
    ('Tráng Miệng', 3);
insert into staff (username, role, name)
values ('admin', 'ADMIN', 'Quản Lý'),
    ('staff1', 'STAFF', 'Nhân Viên 1');
-- Disable RLS for simplicity in this demo (Optional, but easier for beginners)
alter table categories disable row level security;
alter table products disable row level security;
alter table tables disable row level security;
alter table staff disable row level security;
alter table orders disable row level security;
alter table order_items disable row level security;
alter table settings disable row level security;
alter table logs disable row level security;
-- 11. Enable Realtime
begin;
drop publication if exists supabase_realtime;
create publication supabase_realtime;
commit;
alter publication supabase_realtime
add table products;
alter publication supabase_realtime
add table categories;
alter publication supabase_realtime
add table tables;
alter publication supabase_realtime
add table staff;
alter publication supabase_realtime
add table orders;
alter publication supabase_realtime
add table order_items;
alter publication supabase_realtime
add table settings;
alter publication supabase_realtime
add table logs;