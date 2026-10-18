-- V036: requires 013 and 015. No table or ownership reset.
begin;
insert into public.world_wearable_catalog(item_id,target,slot,price) values
('makeup-peach','avatar','makeup',500),
('makeup-freckles','avatar','makeup',700),
('makeup-mauve','avatar','makeup',800),
('glasses-olive','avatar','glasses',1000),
('glasses-rose','avatar','glasses',1000)
on conflict(item_id) do update set target=excluded.target,slot=excluded.slot,price=excluded.price;
commit;
