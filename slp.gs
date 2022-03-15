function slp(args)

nest=subwrd(args,1)
times=subwrd(args,2)
doexit=subwrd(args,3)

say "nest: "nest
say "times: "times
say "doexit: "doexit

varname="slp"

'reinit'

if (nest != 1)
  'xdfopen output/fcst.ctl'
else
  'xdfopen output/fcst.nest02.ctl'
endif

'q file'
lin=sublin(result,5); tsiz=subwrd(lin,12);

if (times=0 | times="" | times="all" | times="All" | times="ALL")
  tmin=1
  tmax=tsiz
else
  argtype=valnum(times)
  if (argtype=1)
    if (times <= tsiz)
      tmin=times
      tmax=times
    else
      tmin=tsiz
      tmax=tsiz
    endif
  else; if (times="last")
    tmin=tsiz
    tmax=tsiz
  endif; endif
endif

'set background 1'
setupcol()
setupconcol()

t=tmin; while(t<=tmax)
  'c'
  'set T 't
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
  'd 'varname

  'set gxout contour'
  'set cthick 1'
  'set clevs '_clevs
  'set ccolor '_TRNBLK
  'd 'varname

  'set clevs'_clevs
  'set ccols '_ccontours
  'd 'varname

  'set ccolor 50';'set cthick 3';'set cstyle 3';'set cint 10';'d grid_lont'
  'set ccolor 50';'set cthick 3';'set cstyle 3';'set cint 10';'d grid_latt'

  'set cthick 6'
  'set ccolor 1'
  'set clevs 0'
  'd zsurf'

*  Draw extreme values
  'set gxout grfill'
  'set clevs '_EXLOVAL' '_EXHIVAL
  'set ccols '_EXLOCOL' 53 '_EXHICOL
  'd 'varname

  'q dims'; lin=sublin(result,5); time=subwrd(lin,6);
  if (nest!=1)
    'draw title Parent tile\'time
  else
    'draw title Nested tile\'time
  endif

  'set vpage off'

  drawcolorbar()

  if (nest!=1)
    if (t<10)
      'gxprint img/'varname'_00't'.png'
    else; if (t<100)
      'gxprint img/'varname'_0't'.png'
    else;
      'gxprint img/'varname'_'t'.png'
    endif; endif;
  else
    if (t<10)
      'gxprint img/'varname'_nest02_00't'.png'
    else; if (t<100)
      'gxprint img/'varname'_nest02_0't'.png'
    else;
      'gxprint img/'varname'_nest02_'t'.png'
    endif; endif;
  endif

  t=t+1
endwhile

if (doexit=1)
  quit
endif

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
_EXLOCOL=203; _EXLOVAL=850;
'set rgb '_EXLOCOL' 255 99 99';
_EXHICOL=204; _EXHIVAL=1100;
'set rgb '_EXHICOL' 66 255 122';


val_i=940; val_int=4; ci=70; cf=93;
_numcols=cf-ci+1
i=ci

'set rgb 'i' 187 215 233'; i=i+1
'set rgb 'i' 119 170 218'; i=i+1
'set rgb 'i' 66 133 192'; i=i+1
'set rgb 'i' 22 67 144'; i=i+1
'set rgb 'i' 0 0 61'; i=i+1

'set rgb 'i' 142 34 178'; i=i+1
'set rgb 'i' 183 14 211'; i=i+1
'set rgb 'i' 248 0 253'; i=i+1

'set rgb 'i' 188 0 0'; i=i+1
'set rgb 'i' 212 0 0'; i=i+1
'set rgb 'i' 253 0 0'; i=i+1

'set rgb 'i' 253 149 0'; i=i+1
'set rgb 'i' 229 188 0'; i=i+1
'set rgb 'i' 253 248 2'; i=i+1

'set rgb 'i' 0 142 30'; i=i+1
'set rgb 'i' 11 197 111'; i=i+1
'set rgb 'i' 4 87 211'; i=i+1
'set rgb 'i' 4 147 231'; i=i+1
'set rgb 'i' 54 212 251'; i=i+1

'set rgb 'i' 204 255 255 0'; i=i+1

'set rgb 'i' 255 200 66'; i=i+1
'set rgb 'i' 235 176 11'; i=i+1
'set rgb 'i' 213 131 1'; i=i+1
'set rgb 'i' 196 95 0'; i=i+1

'set rgb 'i' 241 241 241';

i=ci
_ccols=''
_clevs=''
_cbar=''
while(i<cf)
 val=val_i+((i-ci)*val_int)
 _ccols=_ccols%' '%i
 _clevs=_clevs%' '%val
 _cbar=_cbar%' '%i%' '%val
 i=i+1
endwhile
_ccols=_ccols%' '%i
_cbar=_cbar%' '%i

return

function setupconcol()

val_i=940; val_int=4; ci=100; cf=123;
_numcols=cf-ci+1
i=ci

alpha=111

'set rgb 'i' 187 215 233 'alpha; i=i+1
'set rgb 'i' 119 170 218 'alpha; i=i+1
'set rgb 'i' 66 133 192 'alpha; i=i+1
'set rgb 'i' 22 67 144 'alpha; i=i+1
'set rgb 'i' 0 0 61 'alpha; i=i+1

'set rgb 'i' 142 34 178 'alpha; i=i+1
'set rgb 'i' 183 14 211 'alpha; i=i+1
'set rgb 'i' 248 0 253 'alpha; i=i+1
'set rgb 'i' 188 0 0 'alpha; i=i+1
'set rgb 'i' 212 0 0 'alpha; i=i+1
'set rgb 'i' 253 0 0 'alpha; i=i+1

'set rgb 'i' 253 149 0 'alpha; i=i+1
'set rgb 'i' 229 188 0 'alpha; i=i+1
'set rgb 'i' 253 248 2 'alpha; i=i+1
'set rgb 'i' 0 142 30 'alpha; i=i+1
'set rgb 'i' 11 197 111 'alpha; i=i+1
'set rgb 'i' 4 87 211 'alpha; i=i+1
'set rgb 'i' 4 147 231 'alpha; i=i+1
'set rgb 'i' 54 212 251 'alpha; i=i+1

'set rgb 'i' 204 255 255 0'; i=i+1

'set rgb 'i' 255 200 66 'alpha; i=i+1
'set rgb 'i' 235 176 11 'alpha; i=i+1
'set rgb 'i' 213 131 1 'alpha; i=i+1
'set rgb 'i' 196 95 0 'alpha; i=i+1

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
title   = 'Sea-level pressure [hPa]'

*draw color bar
''src' 'bar_d' 'f_dims' -fskip 5 -direction horizontal -levcol '_cbar' -line off'
'set line 1 1 3'
'draw rec 'box_d

*draw extremes
cell_w=bar_w/10
cell_yi=bar_yi
cell_yf=bar_yf
cell_xf=bar_xi-0.45
cell_xi=cell_xf-cell_w
val_y=cell_yi-0.1
val_x=cell_xi+(cell_w/2.0)
'set line '_EXLOCOL; 'draw recf 'cell_xi' 'cell_yi' 'cell_xf' 'cell_yf
'set line 1 1 3';    'draw rec 'cell_xi' 'cell_yi' 'cell_xf' 'cell_yf
'draw string 'val_x' 'val_y' `3<`0'_EXLOVAL
cell_xi=bar_xf+0.45
cell_xf=cell_xi+cell_w
val_x=cell_xi+(cell_w/2.0)
'set line '_EXHICOL; 'draw recf 'cell_xi' 'cell_yi' 'cell_xf' 'cell_yf
'set line 1 1 3';    'draw rec 'cell_xi' 'cell_yi' 'cell_xf' 'cell_yf
'draw string 'val_x' 'val_y' >'_EXHIVAL

*draw title
if (title != '')
  u_x=bar_xi+(bar_w/2)
  u_y=bar_yf+0.1
 'set string 1 bc'
 'set strsiz 'f_w' 'f_h
 'draw string 'u_x' 'u_y' 'title
endif
return
