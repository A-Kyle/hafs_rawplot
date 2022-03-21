function us(args)

nest=subwrd(args,1)
times=subwrd(args,2)
doexit=subwrd(args,3)

say "nest: "nest
say "times: "times
say "doexit: "doexit

varname="us"

'reinit'

if (nest=0) ;* parent domain only
  'xdfopen output/fcst.ctl'
else; if (nest=1) ;* nest domain only
  'xdfopen output/fcst.nest02.ctl'
else; if (nest=2) ;* both domains
  'xdfopen output/fcst.ctl'
  'xdfopen output/fcst.nest02.ctl'
  fpos="output/nest_coordinates.dat"
else;
  say "Error: Bad domain option; exiting..."
  exit
endif; endif; endif;

'q file 1'
lin=sublin(result,5); xsiz=subwrd(lin,3); ysiz=subwrd(lin,6); tsiz=subwrd(lin,12);
'q file 2'
lin=sublin(result,5); nxsiz=subwrd(lin,3); nysiz=subwrd(lin,6); ntsiz=subwrd(lin,12);

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

if (nest!=2)
  vpg_xi=1.0; vpg_xf=10.0; vpg_yi=1.0; vpg_yf=7.5;
else
  vpg_xi=1.0; vpg_xf=5.5; vpg_yi=1.0; vpg_yf=7.5;
  vpg_nxi=5.5; vpg_nxf=10.0; vpg_nyi=1.0; vpg_nyf=7.5;
endif

t=tmin; while(t<=tmax)
  'c'
  'set dfile 1'
  'set vpage 'vpg_xi' 'vpg_xf' 'vpg_yi' 'vpg_yf
  'set X 1 'xsiz
  'set Y 1 'ysiz
  'set T 't

  'set mpdraw off'
  'set grid off'
  'set xlab off'
  'set ylab off'
  'set clab off'
  'set grads off'

  'set gxout shaded'
  'set clevs '_clevs
  'set ccols '_ccols
  'd 'varname

  'set gxout contour'
  'set cthick 1'
  'set clevs '_clevs
  'set ccolor '_TRNBLK
  'd 'varname

  'set clevs '_clevs
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

  if (nest=2)

    ;* draw nest boundary in parent domain
    rc=read(fpos); lin=sublin(rc,2);
    tstamp=subwrd(lin,1); tchk=subwrd(lin,2);
    if (tstamp=time)
      bl_x=subwrd(lin,3); bl_y=subwrd(lin,4);
      tr_x=subwrd(lin,5); tr_y=subwrd(lin,6);
      bl_x=bl_x-0.5;
      bl_y=bl_y-0.5;
      tr_x=tr_x+0.5;
      tr_y=tr_y+0.5;
      'q gr2xy 'bl_x' 'bl_y
      bl_x=subwrd(result,3); bl_y=subwrd(result,6);
      'q gr2xy 'tr_x' 'tr_y
      tr_x=subwrd(result,3); tr_y=subwrd(result,6);
      'draw rec 'bl_x' 'bl_y' 'tr_x' 'tr_y
    endif

    'set dfile 2'
    'set vpage 'vpg_nxi' 'vpg_nxf' 'vpg_nyi' 'vpg_nyf
    'set X 1 'nxsiz
    'set Y 1 'nysiz
    'set T 't

    'set mpdraw off'
    'set grid off'
    'set xlab off'
    'set ylab off'
    'set clab off'
    'set grads off'

    'set gxout shaded'
    'set clevs '_clevs
    'set ccols '_ccols
    'd 'varname

    'set gxout contour'
    'set cthick 1'
    'set clevs '_clevs
    'set ccolor '_TRNBLK
    'd 'varname

    'set clevs '_clevs
    'set ccols '_ccontours
    'd 'varname

    'set ccolor 50';'set cthick 3';'set cstyle 3';'set cint 10';'d grid_lont'
    'set ccolor 50';'set cthick 3';'set cstyle 3';'set cint 10';'d grid_latt'
    'set cthick 6'
    'set ccolor 1'
    'set clevs 0'
    'd zsurf'

    ;* Draw extreme values
    'set gxout grfill'
    'set clevs '_EXLOVAL' '_EXHIVAL
    'set ccols '_EXLOCOL' 53 '_EXHICOL
    'd 'varname

    'q dims'; lin=sublin(result,5); time=subwrd(lin,6);
    'draw title Nested tile\'time
  endif

  'set vpage off'

  drawcolorbar()

  if (nest=0)
    if (t<10)
      'gxprint img/'varname'_00't'.png'
    else; if (t<100)
      'gxprint img/'varname'_0't'.png'
    else;
      'gxprint img/'varname'_'t'.png'
    endif; endif;
  else; if (nest=1)
    if (t<10)
      'gxprint img/'varname'_nest02_00't'.png'
    else; if (t<100)
      'gxprint img/'varname'_nest02_0't'.png'
    else;
      'gxprint img/'varname'_nest02_'t'.png'
    endif; endif;
  else; if (nest=2)
    if (t<10)
      'gxprint img/'varname'_combo_00't'.png'
    else; if (t<100)
      'gxprint img/'varname'_combo_0't'.png'
    else;
      'gxprint img/'varname'_combo_'t'.png'
    endif; endif;
  endif; endif; endif;

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
_EXLOCOL=203; _EXLOVAL=-105;
'set rgb '_EXLOCOL' 255 66 100';
_EXHICOL=204; _EXHIVAL=105;
'set rgb '_EXHICOL' 66 144 255';

val_i=-85; val_int=10; ci=70; cf=88;
_numcols=cf-ci+1
i=ci

'set rgb 'i' 221 117 239'; i=i+1
'set rgb 'i' 189 52 200'; i=i+1
'set rgb 'i' 149 19 176'; i=i+1

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
title   = 'Surface zonal wind speed [m s`a-1`n]'


*draw color bar
''src' 'bar_d' 'f_dims' -fskip 3 -direction horizontal -levcol '_cbar' -line off'
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
