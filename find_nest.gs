function find_nest(args)
rr=subwrd(args,1)
doquit=subwrd(args,2)

odd=math_mod(rr,2)

debug=0

outputfile="output/nest_coordinates.dat"

'reinit'

'xdfopen output/fcst.ctl'; parentfile=1
'xdfopen output/fcst.nest02.ctl'; nestfile=2

'define plon=grid_lont';*-> static parent grid lon
'define plat=grid_latt';*-> static parent grid lat

'q file 'parentfile
lin=sublin(result,5)
pxsiz=subwrd(lin,3)
pysiz=subwrd(lin,6)

'q file 'nestfile
lin=sublin(result,5)
nxsiz=subwrd(lin,3)
nysiz=subwrd(lin,6)
ntsiz=subwrd(lin,12)

t=1; while(t<=ntsiz)
  'set dfile 'nestfile
  'set T 't
  ;* Depending on whether the refinement ratio is odd or even,
  ;* the approach to finding first-guess nest corner coordinates
  ;* will differ. See pp. 03.15.21 for further information and
  ;* visualization of the problem.
  if (odd=1)
    ;* define corner cells of the nest that overlap a parent cell
    if (t=1)
      nx_BL=math_int((rr/2)+1);*-> bottomleft nest cell's x-loc whose center
                              ;*-> overlaps a parent domain cell center
      ny_BL=nx_BL
      nx_TR=nxsiz-nx_BL+1;*-> topright nest cell's x-loc whose center
                         ;*-> overlaps a parent domain cell center
      ny_TR=nysiz-ny_BL+1
    endif

    ;* get nest's BL corner search tolerances and search center lon/lat
    'set X 'nx_BL-1' 'nx_BL+1
    'set Y 'ny_BL-1' 'ny_BL+1
    'tmpx=cdiff(grid_lont,X)/2'
    'tmpy=cdiff(grid_latt,Y)/2'
    'set X 'nx_BL
    'set Y 'ny_BL
    'd tmpx'; BL_xtol=subwrd(result,4);
    'd tmpy'; BL_ytol=subwrd(result,4);
    'd grid_lont'; BL_lon=subwrd(result,4);
    'd grid_latt'; BL_lat=subwrd(result,4);

    ;* get nest's TR corner search tolerances and search center lon/lat
    'set X 'nx_TR-1' 'nx_TR+1
    'set Y 'ny_TR-1' 'ny_TR+1
    'tmpx=cdiff(grid_lont,X)/2'
    'tmpy=cdiff(grid_latt,Y)/2'
    'set X 'nx_TR
    'set Y 'ny_TR
    'd tmpx'; TR_xtol=subwrd(result,4);
    'd tmpy'; TR_ytol=subwrd(result,4);
    'd grid_lont'; TR_lon=subwrd(result,4);
    'd grid_latt'; TR_lat=subwrd(result,4);
  else
    if (t=1)
      ost=rr/2;
      nx_BL.0=ost;     ny_BL.0=ost     ;* bottomleft nest cell over parent cell's center
      nx_BL.1=ost + 1; ny_BL.1=ost     ;* bottomright ...
      nx_BL.2=ost;     ny_BL.2=ost + 1 ;* topleft ...
      nx_BL.3=ost + 1; ny_BL.3=ost + 1 ;* topright ...

      nx_TR.0=nxsiz-ost;   ny_TR.0=nysiz-ost   ;* bottomleft nest cell over parent cell's center
      nx_TR.1=nxsiz-ost+1; ny_TR.1=nysiz-ost   ;* bottomright ...
      nx_TR.2=nxsiz-ost;   ny_TR.2=nysiz-ost+1 ;* topleft ...
      nx_TR.3=nxsiz-ost+1; ny_TR.3=nysiz-ost+1 ;* topright ...
    endif

    ;* get nest's BL corner search tolerances and search center lon/lat
    sumlon=0; sumlat=0;
    i=0; while(i<4)
      'set X 'nx_BL.i
      'set Y 'ny_BL.i
      'd grid_lont'; BL_lon.i=subwrd(result,4); sumlon=sumlon+BL_lon.i;
      'd grid_latt'; BL_lat.i=subwrd(result,4); sumlat=sumlat+BL_lat.i;
      i=i+1;
    endwhile

    ;* get average lon/lat of the 4 cells, which is roughly
    ;* where the center of the overlying parent cell will be
    BL_lon=sumlon/4.0;
    BL_lat=sumlat/4.0;
    ;* get average nest cell separation for search tolerances
    BL_xtol=((BL_lon.1-BL_lon.0)+(BL_lon.3-BL_lon.2))/2.0;
    BL_ytol=((BL_lat.2-BL_lat.0)+(BL_lat.3-BL_lat.1))/2.0;

    ;* get nest's TR corner search tolerances and search center lon/lat
    sumlon=0; sumlat=0;
    i=0; while(i<4)
      'set X 'nx_TR.i
      'set Y 'ny_TR.i
      'd grid_lont'; TR_lon.i=subwrd(result,4); sumlon=sumlon+TR_lon.i;
      'd grid_latt'; TR_lat.i=subwrd(result,4); sumlat=sumlat+TR_lat.i;
      i=i+1;
    endwhile

    ;* get average lon/lat of the 4 cells, which is roughly
    ;* where the center of the overlying parent cell will be
    TR_lon=sumlon/4.0;
    TR_lat=sumlat/4.0;
    ;* get average nest cell separation for search tolerances
    TR_xtol=((TR_lon.1-TR_lon.0)+(TR_lon.3-TR_lon.2))/2.0;
    TR_ytol=((TR_lat.2-TR_lat.0)+(TR_lat.3-TR_lat.1))/2.0;
  endif

  'set dfile 'parentfile
  'set X 1 'pxsiz
  'set Y 1 'pysiz

  if (debug=1)
    say "nx_BL:"nx_BL
    say "ny_BL:"ny_BL
    say "nx_TR:"nx_TR
    say "ny_TR:"ny_TR

    say "BL_lon:"BL_lon
    say "BL_lat:"BL_lat
    say "TR_lon:"TR_lon
    say "TR_lat:"TR_lat
  endif

  lonmin=BL_lon-BL_xtol; lonmax=BL_lon+BL_xtol;
  latmin=BL_lat-BL_ytol; latmax=BL_lat+BL_ytol;
  'blpt=maskout(maskout(lev,grid_lont-'lonmin'),'lonmax'-grid_lont)'
  'blpt=maskout(maskout(blpt,grid_latt-'latmin'),'latmax'-grid_latt)'
  lonmin=TR_lon-TR_xtol; lonmax=TR_lon+TR_xtol;
  latmin=TR_lat-TR_ytol; latmax=TR_lat+TR_ytol;
  'trpt=maskout(maskout(lev,grid_lont-'lonmin'),'lonmax'-grid_lont)'
  'trpt=maskout(maskout(trpt,grid_latt-'latmin'),'latmax'-grid_latt)'

  'd amaxlocx(blpt, X=1, X='pxsiz', Y=1, Y='pysiz')'; nxi=subwrd(result,4);
  'd amaxlocy(blpt, X=1, X='pxsiz', Y=1, Y='pysiz')'; nyi=subwrd(result,4);
  'd amaxlocx(trpt, X=1, X='pxsiz', Y=1, Y='pysiz')'; nxf=subwrd(result,4);
  'd amaxlocy(trpt, X=1, X='pxsiz', Y=1, Y='pysiz')'; nyf=subwrd(result,4);

  if (debug=1)
    say "nxi:"nxi
    say "nyi:"nyi
    say "nxf:"nxf
    say "nyf:"nyf

    'set mpdraw off'
    'set xlab off'
    'set ylab off'
    'set gxout shaded'
    'd lev'
    'q gr2xy 'nxi' 'nyi
    pxi=subwrd(result,3); pyi=subwrd(result,6);
    'q gr2xy 'nxf' 'nyf
    pxf=subwrd(result,3); pyf=subwrd(result,6);
    'draw rec 'pxi' 'pyi' 'pxf' 'pyf
    'q pos'
    'c'
  endif

  'q time'; tstamp=subwrd(result,3);
  rec=tstamp" "t" "nxi" "nyi" "nxf" "nyf
  q=write(outputfile,rec)

  t=t+1;
endwhile
q=close(outputfile)

if (doquit=1); quit; endif;

return

