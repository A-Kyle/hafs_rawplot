# hafs_rawplot

Latest update 14 Mar 2022 -- Kyle Ahern [NOAA/HRD]

Note: Tested and intended for use with the HAFS branch
feature/hafs_nest_sync , but it should be compatible with
other similar branches that can generate atmos_diag and
grid_mspec forecast files using diag_table.tmp in the HAFS
part directory. For reference, the diag_table.tmp file used
to test this code is provided. The latest version seeing 
immediate development at the time of writing is the newly
minted feature/hafsv0.3_baseline branch, which does not 
include the time-dependent zsurf (surface elevation) field
"mzsurf" seen in this repository's diag_table.tmp . Further,
output of atmos_diag files has been disabled in the newest 
branch's diag_table files by default. To plot all fields 
handled by this repository in the feature/hafsv0.3_baseline 
branch, the user must:
1) Uncomment the "atmos_diag" line under "output files"
   in the diag_table.tmp file they will use with HAFS
2) Add the "mzsurf" field to the "grid_mspec" output fields
   (as seen on line 36 of this repository's diag_table.tmp
   file).

This repository contains various scripts written in Bash
that can be used to convert raw HAFS files (i.e., without 
post-processing) to a more friendly NetCDF format with GrADS
compatibility. The core script, convert_fcst.sh, should
be modified by the user to specify where their HAFS build is
located, as well as what case to process. By default, all
output generated by the core program is placed in the
given case's cycle directory, in a new subdirectory called
"raw/" . 

Upon execution, the core script copies all .gs and .ctl
files (GrADS scripts and templates) used for plotting to the 
raw directory. The program then utilizes nco libraries to 
extract and convert the fields desired by the user, which are
saved in the "raw/output/" subdirectory. The user can modify
the section at the top of the core script to constrain the
conversion procedure to conserve time and space, which should
be useful for debugging (e.g., a user can specify that only
specific forecast output files should be processed). After
conversion, the program then uses GrADS in batch mode to
generate various images of the parent and/or nested domain
fields on their native grids. As with the conversion 
procedure, the core script can be modified by the user to 
specify which plots (if any) should be generated by the 
program.

In sum, the core program of this directory can:
1) Convert raw atmos_diag and grid_mspec A-grid fields for 
   single-nested domain forecast simulations, such that
   fields are not pseudo-mirrored geospatially by default
2) Combine user-specified fields from atmos_diag and
   grid_mspec files into a single ("fcst") file
3) Plot various commonly-used fields on HAFS native grids
   using GrADS and save results as .png files

The set of .gs scripts utilizes a publically available 
script "xcbar.gs" for colorbar generation, which can be 
found at
https://github.com/kodamail/gscript/blob/master/xcbar.gs

