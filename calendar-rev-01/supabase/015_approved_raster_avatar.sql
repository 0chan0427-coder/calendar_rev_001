-- V032. Requires 013_world_appearance.sql; 014 is not required. Existing ownership remains.
begin;
insert into public.world_wearable_catalog(item_id,target,slot,price) values
('hair-chestnut','avatar','hair',0),
('hair-none','avatar','hair',0),
('hair-short-chestnut','avatar','hair',0),
('hair-bob-brown','avatar','hair',0),
('top-base','avatar','top',0),
('top-mint','avatar','top',0),
('top-shirt-blue','avatar','top',1500),
('top-pink','avatar','top',1500),
('bottom-base','avatar','bottom',0),
('bottom-shorts-cream','avatar','bottom',0),
('bottom-trousers','avatar','bottom',2000),
('shoes-none','avatar','shoes',0),
('shoes-cream','avatar','shoes',0),
('shoes-boots','avatar','shoes',1500),
('eyes-default','avatar','face',0),
('eyes-smile','avatar','face',0),
('skin-default','avatar','skin',0),
('skin-warm','avatar','skin',0),
('makeup-none','avatar','makeup',0),
('makeup-blush','avatar','makeup',0),
('makeup-rose','avatar','makeup',500),
('glasses-none','avatar','glasses',0),
('glasses-round','avatar','glasses',0),
('glasses-gold','avatar','glasses',1000),
('ribbon-avatar','avatar','accessory',1000),
('cat-ivory','cat','coat',0),
('cat-cheese','cat','coat',1500),
('cat-gray','cat','coat',1500),
('ribbon-cat','cat','accessory',500)
on conflict(item_id) do update set target=excluded.target,slot=excluded.slot,price=excluded.price;
commit;
