#!/bin/bash

origin=$(pwd)

# -->  Uncomment the hafsdir line below, and
# -->  set the full path to your hafs directory
# -->  EXAMPLE:
# -->  hafsdir="/work/noaa/aoml-hafs1/kahern/HF_regional_020122/HAFS"
#hafsdir="/path/to/your/hafs/directory"
hafsdir="/scratch2/NAGAPE/aoml-hafs1/Kyle.Ahern/hafsv0.3_baseline/HAFS"

# -->  Uncomment the subexpt line below, and
# -->  set it to the config.SUBEXPT variable in
# -->  your cronjob_hafs*.sh submission script.
# -->  It should be the same as the name of the
# -->  directory holding all of the case's output
# -->  in your runs/scrub directory.
# -->  EXAMPLE:
# -->  subexpt="HAFS_C512_regional_1mvnest_storm"
subexpt="HAFS_Ida_1mvnest_storm"

# -->  Uncomment the cycle line below, and
# -->  set it to whichever cycle you would like
# -->  to process
# -->  EXAMPLE:
# -->  cycle="2021070200"
cycle="2021082700"

# -->  Uncomment the storm line below, and
# -->  set it to whichever storm you would like
# -->  to process for the cycle given
# -->  EXAMPLE:
# -->  storm="05L"
storm="09L"

# variables to process
proctime=0    # set to either:
              #   A) the output step number to process
              #      [i.e., set to X to process files only for output step X]
              #   B) a number greater than the number of output steps
              #      to process files for only the last output step
              #   C) 0 to process every output step

procmoad=0 # set to 0 to skip all processing of parent domain fcst files
procnest=0 # set to 0 to skip all processing of nest domain fcst files
diagvars="us,vs,t850,rh500,slp"       # variables from atmos_diag files
gridvars="grid_lont,grid_latt"        # variables from grid_mspec files

refine_ratio=3

# images to generate
drawmoad=1    # set to 1 to draw parent domain images
drawnest=1    # set to 1 to draw nest domain images

drawallvars=0 # override: set to 1 to draw all available fields
              #           otherwise, process individual field flags below
drawslp=1     # 1 to draw slp field
drawusfc=1    # 1 to draw u_sfc field
drawvsfc=1    # 1 to draw v_sfc field
drawwindsfc=1 # 1 to draw sfc horizontal wind magnitude
drawt850=1    # 1 to draw T_850 field
drawrh500=1   # 1 to draw rh_500 field
drawzsurf=0   # 1 to draw sfc elevation field

# % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % #
#% # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % ##
# % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % #
#% # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % ##
# % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % # % #

#---------------------------------------------------#
# nothing should need to be altered below this line #
#---------------------------------------------------#

if [ -z "$hafsdir" ] || [ -z "$subexpt" ] || [ -z "$cycle" ] || [ -z "$storm" ] ; then
  echo "Error: Case parameters not specified. Exiting."
  exit 1
fi

# pull and print case directory info
cdscrub=$(sed -n -e '/^CDSCRUB/ s/.*\= *//p' ${hafsdir}/parm/system.conf)
workdir="${cdscrub}/${subexpt}/${cycle}/${storm}"
echo
echo "scrub:    ${cdscrub}"
echo "subexpt:  ${subexpt}"
echo "cycle:    ${cycle}"
echo "storm:    ${storm}"
echo "workdir:  ${workdir}"

# reinitialize working directories
preprocdir="${workdir}/raw"
sdfdir="${preprocdir}/output"
imgdir="${preprocdir}/img"
mkdir -p "${sdfdir}"
mkdir -p "${imgdir}"

# copy over scripts and templates to working directory and navigate there
cp *.gs ${preprocdir}
cp *.ctl ${preprocdir}
cd ${preprocdir}

# construct I/O file prefixes
in_dir="${workdir}/forecast/"
out_dir="${sdfdir}/"
diag_moad_pref=${in_dir}"atmos_diag_"
diag_nest_pref=${in_dir}"atmos_diag.nest02_"
grid_moad_pref=${in_dir}"grid_mspec_"
grid_nest_pref=${in_dir}"grid_mspec.nest02_"
out_moad_pref=${out_dir}"fcst_"
out_nest_pref=${out_dir}"fcst.nest02_"

# load required modules for processing and img generation
module load nco
module load grads

if [ $procmoad == 1 ] ; then

  echo
  echo "   =========================================   "
  echo "   Processing parent domain (MOAD) output...   "
  echo "   =========================================   "
  echo

  numfiles=$(ls -1q ${diag_moad_pref}* | wc -l)
  if [ $proctime -gt $numfiles ] ; then
    proctime=$numfiles
  fi
  if [ $proctime != 0 ] ; then
    numfiles=1
  fi

  declare -i f; f=1
  for diag_file in ${diag_moad_pref}* ; do
    # cut diag_moad_pref from beginning of file path & name
    # append grid_moad_pref to beginning of remainder to get grid_file
    grid_file=${grid_moad_pref}${diag_file##${diag_moad_pref}}

    ncdump -k $grid_file >& /dev/null
    if [[ $? != 0 ]]; then
      echo "ERROR ncfile ${grid_file} not found"
      exit
    fi

    if [ $f == 1 ] || [ $f == $proctime ] ; then
      # get x,y dimension sizes
      xsiz=$(ncks --trd -m -M ${grid_file} | grep -E -i ": grid_xt, size =" | cut -f 7 -d ' ' | uniq)
      ysiz=$(ncks --trd -m -M ${grid_file} | grep -E -i ": grid_yt, size =" | cut -f 7 -d ' ' | uniq)

      # get init timestamp elements
      sffx=${diag_file##${diag_moad_pref}} # isolate string with elements
      yyyy=${sffx%%_*} # cut everything after & including first '_' (yields year)
      sffx=${sffx#*_}  # cut everything before & including first '_' (cuts year)
      mm=${sffx%%_*}   # cut everything after & including first '_' (yields 2digit month)
      sffx=${sffx#*_}  # cut everything before & including first '_' (cuts month)
      dd=${sffx%%_*}   # 2-digit day
      sffx=${sffx#*_}
      hh=${sffx%%.*}   # 2-digit hour

      case $mm in
        01) mon="JAN" ;;
        02) mon="FEB" ;;
        03) mon="MAR" ;;
        04) mon="APR" ;;
        05) mon="MAY" ;;
        06) mon="JUN" ;;
        07) mon="JUL" ;;
        08) mon="AUG" ;;
        09) mon="SEP" ;;
        10) mon="OCT" ;;
        11) mon="NOV" ;;
        12) mon="DEC" ;;
        *)
          echo "ERROR in timestamp retrieval (bad month)"
          exit
          ;;
      esac
      # make GrADS initial timestamp
      tinit=${hh}Z${dd}${mon}${yyyy}
    fi

    if [ $proctime -gt 0 ] && [ $proctime != $f ] ; then
      f+=1
      continue
    fi

    out_file=${out_moad_pref}${diag_file##${diag_moad_pref}}
    echo " Creating: ${out_file}"

    # netCDF Permute Dimensions: mirror X and Y dimensions for diag fields
    ncpdq -Oh -v $diagvars -a -grid_yt,-grid_xt $diag_file $out_file
    ncpdq -A -v $gridvars -a -grid_yt,-grid_xt $grid_file $out_file

    # netCDF kitchen sink: append monotonically increasing X, Y dimensions
    #        (without this step, X & Y vectors decrease, leads to errors)
    ncks -A -v grid_yt,grid_xt $grid_file $out_file

    f+=1
  done

  echo " Creating: fcst.ctl"
  dt="3HR"
  basename="fcst"
  sed -e "s/_BASENAME_/${basename}/g" \
      -e "s/_XSIZ_/${xsiz}/g" \
      -e "s/_YSIZ_/${ysiz}/g" \
      -e "s/_TSIZ_/${numfiles}/g" \
      -e "s/_TINIT_/${tinit}/g" \
      -e "s/_DT_/${dt}/g" \
      template.ctl > ${out_dir}fcst.ctl

fi

if [ $procnest == 1 ] ; then

  echo
  echo "   =========================================   "
  echo "       Processing nest domain output...        "
  echo "   =========================================   "
  echo

  numfiles=$(ls -1q ${diag_nest_pref}* | wc -l)
  if [ $proctime -gt $numfiles ] ; then
    proctime=$numfiles
  fi
  if [ $proctime != 0 ] ; then
    numfiles=1
  fi

  declare -i f; f=1
  for diag_file in ${diag_nest_pref}* ; do
    grid_file=${grid_nest_pref}${diag_file##${diag_nest_pref}}
    ncdump -k $grid_file >& /dev/null
    if [[ $? != 0 ]]; then
      echo "ERROR ncfile ${grid_file} not found"
      exit
    fi

    if [ $f == 1 ] || [ $f == $proctime ] ; then
      # get x,y dimension sizes
      xsiz=$(ncks --trd -m -M ${grid_file} | grep -E -i ": grid_xt, size =" | cut -f 7 -d ' ' | uniq)
      ysiz=$(ncks --trd -m -M ${grid_file} | grep -E -i ": grid_yt, size =" | cut -f 7 -d ' ' | uniq)

      if [ $procmoad != 1 ] ; then
        # get init timestamp elements
        sffx=${diag_file##${diag_nest_pref}} # isolate string with elements
        yyyy=${sffx%%_*} # cut everything after & including first '_' (yields year)
        sffx=${sffx#*_}  # cut everything before & including first '_' (cuts year)
        mm=${sffx%%_*}   # cut everything after & including first '_' (yields 2digit month)
        sffx=${sffx#*_}  # cut everything before & including first '_' (cuts month)
        dd=${sffx%%_*}   # 2-digit day
        sffx=${sffx#*_}
        hh=${sffx%%.*}   # 2-digit hour

        case $mm in
          01) mon="JAN" ;;
          02) mon="FEB" ;;
          03) mon="MAR" ;;
          04) mon="APR" ;;
          05) mon="MAY" ;;
          06) mon="JUN" ;;
          07) mon="JUL" ;;
          08) mon="AUG" ;;
          09) mon="SEP" ;;
          10) mon="OCT" ;;
          11) mon="NOV" ;;
          12) mon="DEC" ;;
          *)
            echo "ERROR in timestamp retrieval (bad month)"
            exit
            ;;
        esac
        # make GrADS initial timestamp
        tinit=${hh}Z${dd}${mon}${yyyy}
      fi
    fi

    if [ $proctime -gt 0 ] && [ $proctime != $f ] ; then
      f+=1
      continue
    fi

    out_file=${diag_file##${diag_nest_pref}}
    out_file=${out_nest_pref}${out_file%%.*}".nc"
    echo " Creating: ${out_file}"

    ncpdq -Oh -v $diagvars -a -grid_yt,-grid_xt $diag_file $out_file
    ncpdq -A -v $gridvars -a -grid_yt,-grid_xt $grid_file $out_file
    ncks -A -v grid_yt,grid_xt $grid_file $out_file

    f+=1
  done

  echo " Creating: fcst.nest02.ctl"
  dt="3HR"
  basename="fcst.nest02"
  sed -e "s/_BASENAME_/${basename}/g" \
      -e "s/_XSIZ_/${xsiz}/g" \
      -e "s/_YSIZ_/${ysiz}/g" \
      -e "s/_TSIZ_/${numfiles}/g" \
      -e "s/_TINIT_/${tinit}/g" \
      -e "s/_DT_/${dt}/g" \
      template.ctl > ${out_dir}fcst.nest02.ctl

fi

if [ $procmoad == 1 ] && [ $procnest == 1 ] ; then

  echo
  echo "   =========================================   "
  echo "       Extracting nest position data...        "
  echo "   =========================================   "
  echo

  grads -blc "find_nest.gs ${refine_ratio} 1" > find_nest.log

fi


echo
echo "   =========================================   "
echo "             Generating images...              "
echo "   =========================================   "
echo

if [ $proctime != 0 ] ; then
  drawtime=1
else
  drawtime=0
fi



if [ $drawmoad == 1 ] && [ $drawnest == 1 ] ; then
  echo " Drawing MOAD & nest vars for time = ${proctime} :" ;
  if [ $drawallvars != 1 ] ; then
    if [ $drawslp == 1 ] ;  then echo "   slp" ;      grads -blc "slp.gs 2 ${drawtime} 1"     > grads.log ; fi
    if [ $drawusfc == 1 ] ;     then echo "   usfc" ;     grads -blc "us.gs 2 ${drawtime} 1"      >> grads.log ; fi
    if [ $drawvsfc == 1 ] ;     then echo "   vsfc" ;     grads -blc "vs.gs 2 ${drawtime} 1"      >> grads.log ; fi
    if [ $drawwindsfc == 1 ] ;  then echo "   windsfc" ;  grads -blc "vtotals.gs 2 ${drawtime} 1" >> grads.log ; fi
    if [ $drawt850 == 1 ] ;     then echo "   t850" ;     grads -blc "t850.gs 2 ${drawtime} 1"    >> grads.log ; fi
    if [ $drawrh500 == 1 ] ;    then echo "   rh500" ;    grads -blc "rh.gs 2 ${drawtime} 1"      >> grads.log ; fi
    if [ $drawzsurf == 1 ] ;    then echo "   zsurf" ;    grads -blc "zsurf.gs 2 ${drawtime} 1"   >> grads.log ; fi
  else
    echo "   slp" ;  grads -blc "slp.gs 2 ${drawtime} 1"     > grads.log
    echo "   usfc" ;     grads -blc "us.gs 2 ${drawtime} 1"  >> grads.log
    echo "   vsfc" ;     grads -blc "vs.gs 2 ${drawtime} 1"  >> grads.log
    echo "   windsfc" ;  grads -blc "vtotals.gs 2 ${drawtime} 1" >> grads.log
    echo "   t850" ;     grads -blc "t850.gs 2 ${drawtime} 1"    >> grads.log
    echo "   rh500" ;    grads -blc "rh.gs 2 ${drawtime} 1"  >> grads.log
    # echo "   zsurf" ;    grads -blc "zsurf.gs 2 ${drawtime} 1"   >> grads.log
  fi
else
  if [ $drawmoad == 1 ] ; then
    echo " Drawing MOAD vars for time = ${proctime} :" ;
    if [ $drawallvars != 1 ] ; then
      if [ $drawslp == 1 ] ;  then echo "   slp" ;      grads -blc "slp.gs 0 ${drawtime} 1"     > grads.log ; fi
      if [ $drawusfc == 1 ] ;     then echo "   usfc" ;     grads -blc "us.gs 0 ${drawtime} 1"      >> grads.log ; fi
      if [ $drawvsfc == 1 ] ;     then echo "   vsfc" ;     grads -blc "vs.gs 0 ${drawtime} 1"      >> grads.log ; fi
      if [ $drawwindsfc == 1 ] ;  then echo "   windsfc" ;  grads -blc "vtotals.gs 0 ${drawtime} 1" >> grads.log ; fi
      if [ $drawt850 == 1 ] ;     then echo "   t850" ;     grads -blc "t850.gs 0 ${drawtime} 1"    >> grads.log ; fi
      if [ $drawrh500 == 1 ] ;    then echo "   rh500" ;    grads -blc "rh.gs 0 ${drawtime} 1"      >> grads.log ; fi
      if [ $drawzsurf == 1 ] ;    then echo "   zsurf" ;    grads -blc "zsurf.gs 0 ${drawtime} 1"   >> grads.log ; fi
    else
      echo "   slp" ;  grads -blc "slp.gs 0 ${drawtime} 1"     > grads.log
      echo "   usfc" ;     grads -blc "us.gs 0 ${drawtime} 1"  >> grads.log
      echo "   vsfc" ;     grads -blc "vs.gs 0 ${drawtime} 1"  >> grads.log
      echo "   windsfc" ;  grads -blc "vtotals.gs 0 ${drawtime} 1" >> grads.log
      echo "   t850" ;     grads -blc "t850.gs 0 ${drawtime} 1"    >> grads.log
      echo "   rh500" ;    grads -blc "rh.gs 0 ${drawtime} 1"  >> grads.log
      # echo "   zsurf" ;    grads -blc "zsurf.gs 0 ${drawtime} 1"   >> grads.log
    fi
  fi
  if [ $drawnest == 1 ] ; then
    echo " Drawing nest vars for time = ${proctime} :" ;
    if [ $drawallvars != 1 ] ; then
      if [ $drawslp == 1 ] ;  then echo "   slp" ;      grads -blc "slp.gs 1 ${drawtime} 1"     > grads.log ; fi
      if [ $drawusfc == 1 ] ;     then echo "   usfc" ;     grads -blc "us.gs 1 ${drawtime} 1"      >> grads.log ; fi
      if [ $drawvsfc == 1 ] ;     then echo "   vsfc" ;     grads -blc "vs.gs 1 ${drawtime} 1"      >> grads.log ; fi
      if [ $drawwindsfc == 1 ] ;  then echo "   windsfc" ;  grads -blc "vtotals.gs 1 ${drawtime} 1" >> grads.log ; fi
      if [ $drawt850 == 1 ] ;     then echo "   t850" ;     grads -blc "t850.gs 1 ${drawtime} 1"    >> grads.log ; fi
      if [ $drawrh500 == 1 ] ;    then echo "   rh500" ;    grads -blc "rh.gs 1 ${drawtime} 1"      >> grads.log ; fi
      if [ $drawzsurf == 1 ] ;    then echo "   zsurf" ;    grads -blc "zsurf.gs 1 ${drawtime} 1"   >> grads.log ; fi
    else
      echo "   slp" ;  grads -blc "slp.gs 1 ${drawtime} 1"     > grads.log
      echo "   usfc" ;     grads -blc "us.gs 1 ${drawtime} 1"  >> grads.log
      echo "   vsfc" ;     grads -blc "vs.gs 1 ${drawtime} 1"  >> grads.log
      echo "   windsfc" ;  grads -blc "vtotals.gs 1 ${drawtime} 1" >> grads.log
      echo "   t850" ;     grads -blc "t850.gs 1 ${drawtime} 1"    >> grads.log
      echo "   rh500" ;    grads -blc "rh.gs 1 ${drawtime} 1"  >> grads.log
      # echo "   zsurf" ;    grads -blc "zsurf.gs 1 ${drawtime} 1"   >> grads.log
    fi
  fi
fi

echo
echo "   Done!   "
echo

exit

