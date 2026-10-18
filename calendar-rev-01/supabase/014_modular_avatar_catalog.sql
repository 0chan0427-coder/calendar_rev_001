-- V031: run after 013_world_appearance.sql. Preserves purchases and equipment.
begin;
insert into public.world_wearable_catalog(item_id,target,slot,price) values
('hair-chestnut','avatar','hair',0),
('hair-short-chestnut','avatar','hair',0),
('hair-bob-brown','avatar','hair',0),
('hair-black','avatar','hair',1500),
('hair-rose','avatar','hair',2000),
('hair-long-dark','avatar','hair',2500),
('top-tee-ivory','avatar','top',0),
('top-mint','avatar','top',0),
('top-shirt-blue','avatar','top',1500),
('top-pink','avatar','top',1500),
('bottom-shorts-cream','avatar','bottom',0),
('bottom-mint','avatar','bottom',0),
('bottom-trousers','avatar','bottom',2000),
('bottom-jeans','avatar','bottom',2000),
('bottom-skirt-sage','avatar','bottom',1500),
('bottom-pink','avatar','bottom',1500),
('shoes-cream','avatar','shoes',0),
('shoes-boots','avatar','shoes',1500),
('shoes-maryjane','avatar','shoes',1000),
('ribbon-avatar','avatar','accessory',1000),
('cat-ivory','cat','coat',0),
('cat-cheese','cat','coat',1500),
('cat-gray','cat','coat',1500),
('cat-tuxedo','cat','coat',2000),
('ribbon-cat','cat','accessory',500)
on conflict(item_id) do update set target=excluded.target,slot=excluded.slot,price=excluded.price;
commit;
