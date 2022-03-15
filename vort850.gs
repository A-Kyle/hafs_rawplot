'reinit'
'xdfopen output/fcst.nest02.ctl'

'set background 1'
'c'
'set T 16'
setupcol()
setupconcol()

'set vpage 1.0 10.0 1.0 7.5'

'set mpdraw off'
'set grid off'
'set xlab off'
'set ylab off'
'set clab off'
'set grads off'

'set gxout grfill'
'set clevs '_clevs
'set ccols '_ccols
'd vort850*pow(10,4)'
'set gxout contour'
'set clevs '_clevs
'set ccolor '_TRNBLK
*'d us'
'set clevs'_clevs
'set ccols '_ccontours
*'d us'
'set ccolor 50';'set cthick 3';'set cstyle 3';'set cint 10';'d grid_lont'
'set ccolor 50';'set cthick 3';'set cstyle 3';'set cint 10';'d grid_latt'

'set vpage off'

drawcolorbar()

return


function setupcol()

'set rgb 50 0 0 0 111'
'set rgb 51 0 0 88 188'
'set rgb 52 0 0 0 40'
'set rgb 53 0 0 0 0'
'set tile 60 5 9 9 3 52 53'
'set rgb 54 tile 60'

_OFFWHITE=201
'set rgb '_OFFWHITE' 249 249 249';
_TRNBLK=202
'set rgb '_TRNBLK' 1 1 1 66';

val_min=2; val_max=64; val_fac=2; ci=70; cf=88;
*_numcols=cf-ci+1
i=ci

*'set rgb 'i' 221 117 239'; i=i+1
*'set rgb 'i' 189 52 200'; i=i+1
*'set rgb 'i' 149 19 176'; i=i+1

'set rgb 'i' 0 87 169'; i=i+1
'set rgb 'i' 14 133 201'; i=i+1
'set rgb 'i' 29 173 231'; i=i+1
'set rgb 'i' 59 218 254'; i=i+1

'set rgb 'i' 3 161 17'; i=i+1
'set rgb 'i' 11 219 71'; i=i+1

'set rgb 'i' 204 255 255 0'; i=i+1

'set rgb 'i' 248 197 44'; i=i+1
'set rgb 'i' 233 150 29'; i=i+1

'set rgb 'i' 225 87 13'; i=i+1
'set rgb 'i' 215 11 3'; i=i+1
'set rgb 'i' 181 4 0'; i=i+1
'set rgb 'i' 134 1 0'; i=i+1

'set rgb 'i' 199 37 141'; i=i+1
'set rgb 'i' 241 77 211'; i=i+1
'set rgb 'i' 254 160 233'; i=i+1

'set rgb 'i' 241 241 241';


* make negative scale
ival=val_max
i=ci
_ccols=''
_clevs=''
_cbar=''
while(ival>=val_min)
*  val=val_i+((i-ci)*val_int)
  _ccols=_ccols%' '%i
  _clevs=_clevs%' '%-ival
  _cbar=_cbar%' '%i%' '%-ival
  ival=ival/val_fac
  i=i+1
endwhile

* append near-zero values
_ccols=_ccols%' '%i
_cbar=_cbar%' '%i
i=i+1

* append positive scale
ival=val_min
while(ival<=val_max)
*  val=val_i+((i-ci)*val_int)
  _ccols=_ccols%' '%i
  _clevs=_clevs%' '%ival
  _cbar=_cbar%' '%ival%' '%i
  ival=ival*val_fac
  i=i+1
endwhile

return

function setupconcol()

val_i=-85; val_int=10; ci=100; cf=118;
_numcols=cf-ci+1
i=ci

alpha=111

'set rgb 'i' 221 117 239 'alpha; i=i+1
'set rgb 'i' 189 52 200 'alpha; i=i+1
'set rgb 'i' 149 19 176 'alpha; i=i+1

'set rgb 'i' 0 87 169 'alpha; i=i+1
'set rgb 'i' 14 133 201 'alpha; i=i+1
'set rgb 'i' 29 173 231 'alpha; i=i+1
'set rgb 'i' 59 218 254 'alpha; i=i+1

'set rgb 'i' 3 161 17 'alpha; i=i+1
'set rgb 'i' 11 219 71 'alpha; i=i+1

'set rgb 'i' 204 255 255 0'; i=i+1

'set rgb 'i' 248 197 44 'alpha; i=i+1
'set rgb 'i' 233 150 29 'alpha; i=i+1

'set rgb 'i' 225 87 13 'alpha; i=i+1
'set rgb 'i' 215 11 3 'alpha; i=i+1
'set rgb 'i' 181 4 0 'alpha; i=i+1
'set rgb 'i' 134 1 0 'alpha; i=i+1

'set rgb 'i' 199 37 141 'alpha; i=i+1
'set rgb 'i' 241 77 211 'alpha; i=i+1
'set rgb 'i' 254 160 233 'alpha; i=i+1

'set rgb 'i' 241 241 241 'alpha;

i=ci
_ccontours=''
while(i<cf)
 val=val_i+((i-ci)*val_int)
 _ccontours=_ccontours%' '%i
 i=i+1
endwhile
_ccontours=_ccontours%' '%i

return


**********************************************************************
function drawcolorbar()
*'set font 11'
*colorbar specifications
src     = 'xcbar.gs'
bar_h   = 0.11
bar_w   = 5.5
bar_xi  = 2.75
bar_xf  = bar_xi + bar_w
bar_yf  = 0.75 + bar_h
bar_yi  = 0.75
bar_d   = bar_xi%' '%bar_xf%' '%bar_yi%' '%bar_yf
box_d   = bar_xi%' '%bar_yi%' '%bar_xf%' '%bar_yf
f_w = 0.15
f_h = 0.17
f_dims  = '-fwidth '%f_w%' -fheight '%f_h
title   = '850 hPa Vorticity [10`a-4`n s`a-1`n]'


*draw color bar
''src' 'bar_d' 'f_dims' -fskip 2 -direction horizontal -levcol '_cbar' -line off'
'set line 1 1 3'
'draw rec 'box_d

*draw title
if (title != '')
  u_x=bar_xi+(bar_w/2)
  u_y=bar_yf+0.1
 'set string 1 bc'
 'set strsiz 'f_w' 'f_h
 'draw string 'u_x' 'u_y' 'title
endif
return
