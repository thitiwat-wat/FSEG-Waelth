import urllib.request,urllib.error,json
base='http://127.0.0.1:8030'
auth={'oai-authenticated-user-id':'local-test-admin','oai-authenticated-user-email':'thitiwat.tl@gmail.com','Origin':base,'Content-Type':'application/json'}
def call(path,method='GET',data=None,headers=None):
 req=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,headers=headers or {},method=method)
 try:
  r=urllib.request.urlopen(req);return r.status,r.read().decode()
 except urllib.error.HTTPError as e:return e.code,e.read().decode()
assert call('/api/cms/articles')[0]==403
assert call('/api/cms/articles',headers={**auth,'oai-authenticated-user-email':'other@example.com'})[0]==403
assert call('/api/cms/articles','POST',{}, {**auth,'Origin':'https://evil.invalid'})[0]==403
article={'category':'ความรู้ด้านอาชีพ','title':'บทความทดสอบระบบชั่วคราว','intro':'<p>เกริ่นนำ</p>','body':'<h2>เนื้อหา</h2><div>บรรทัดแรก</div><div>บรรทัดที่สอง</div><p>ทดสอบ</p><img src=x onerror=alert(1)><script>alert(1)</script>','status':'draft'}
s,v=call('/api/cms/articles','POST',article,auth);assert s==200,(s,v);a=json.loads(v);id=a['id'];version=a['version']
s,v=call('/api/cms/articles/'+id,headers=auth);assert s==200
assert 'onerror' not in v and '<script' not in v
assert call('/knowledge/articles/'+id)[0]==404
s,v=call('/api/cms/articles/'+id,'PUT',{**article,'status':'published','version':version},auth);assert s==200,(s,v)
detail=call('/knowledge/articles/'+id)[1]
assert 'บรรทัดแรก</div><div>บรรทัดที่สอง' in detail
assert 'วันเผยแพร่เมื่อ :' in detail and 'ปรับปรุงเนื้อหาบทความ :' in detail
assert 'ผู้เขียนและผู้ตรวจสอบเนื้อหา' in detail
assert 'สนใจสมัครตัวแทน' in detail
assert id in call('/')[1]
assert call('/knowledge/articles/'+id)[0]==200
assert id in call('/knowledge')[1]
assert call('/api/cms/articles/'+id,'PUT',{**article,'version':version},auth)[0]==409
s,v=call('/api/cms/articles/'+id,'GET',headers=auth);version=json.loads(v)['version']
assert call('/api/cms/articles/'+id,'PUT',{**article,'version':version},auth)[0]==200
assert call('/knowledge/articles/'+id)[0]==404
assert call('/api/cms/articles/'+id,'DELETE',headers=auth)[0]==200
assert id not in call('/api/cms/articles',headers=auth)[1]
for path in ['/','/about','/career','/contact','/services','/services/1','/knowledge']:
 assert call(path)[0]==200,path
print('PASS: authorization, CSRF, draft privacy, sanitized HTML, publish/unpublish, conflict protection, archive, legacy routes')

assert 'YOUR NEXT CHAPTER STARTS HERE' in call('/')[1]
assert 'ไม่พบหน้าที่ต้องการ' not in call('/')[1]

k=call('/knowledge')[1]
assert k.index('บทความแนะนำ') < k.index('บทความและข่าวสารล่าสุด')
