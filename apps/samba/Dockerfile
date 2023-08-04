FROM alpine:3.11

# Install samba
RUN apk --no-cache --no-progress upgrade
RUN apk --no-cache --no-progress add bash shadow tini tzdata
RUN apk --no-cache --no-progress add samba
RUN addgroup -S smb
RUN adduser -S -D -H -h /tmp -s /sbin/nologin -G smb -g 'Samba User' smbuser
RUN sed -i 's|^;* *\(log file = \).*|   \1/dev/stdout|' "/etc/samba/smb.conf"
RUN sed -i 's|^;* *\(load printers = \).*|   \1no|' "/etc/samba/smb.conf"
RUN sed -i 's|^;* *\(printcap name = \).*|   \1/dev/null|' "/etc/samba/smb.conf"
RUN sed -i 's|^;* *\(printing = \).*|   \1bsd|' "/etc/samba/smb.conf"
RUN sed -i 's|^;* *\(unix password sync = \).*|   \1no|' "/etc/samba/smb.conf"
RUN sed -i 's|^;* *\(preserve case = \).*|   \1yes|' "/etc/samba/smb.conf"
RUN sed -i 's|^;* *\(short preserve case = \).*|   \1yes|' "/etc/samba/smb.conf"
RUN sed -i 's|^;* *\(default case = \).*|   \1lower|' "/etc/samba/smb.conf"
RUN sed -i '/Share Definitions/,$d' "/etc/samba/smb.conf"
RUN echo '   pam password change = yes' >>"/etc/samba/smb.conf"
RUN echo '   map to guest = bad user' >>"/etc/samba/smb.conf"
RUN echo '   usershare allow guests = yes' >>"/etc/samba/smb.conf"
RUN echo '   create mask = 0777' >>"/etc/samba/smb.conf"
RUN echo '   force create mode = 0777' >>"/etc/samba/smb.conf"
RUN echo '   directory mask = 0777' >>"/etc/samba/smb.conf"
RUN echo '   force directory mode = 0777' >>"/etc/samba/smb.conf"
RUN echo '   force security mode = 0777' >>"/etc/samba/smb.conf"
RUN echo '   force user = smbuser' >>"/etc/samba/smb.conf"
RUN echo '   inherit permissions = no' >>"/etc/samba/smb.conf"
RUN echo '   force group = smb' >>"/etc/samba/smb.conf"
RUN echo '   follow symlinks = yes' >>"/etc/samba/smb.conf"
RUN echo '   load printers = no' >>"/etc/samba/smb.conf"
RUN echo '   printing = bsd' >>"/etc/samba/smb.conf"
RUN echo '   printcap name = /dev/null' >>"/etc/samba/smb.conf"
RUN echo '   disable spoolss = yes' >>"/etc/samba/smb.conf"
RUN echo '   strict locking = no' >>"/etc/samba/smb.conf"
RUN echo '   aio read size = 0' >>"/etc/samba/smb.conf"
RUN echo '   aio write size = 0' >>"/etc/samba/smb.conf"
RUN echo '   vfs objects = catia fruit recycle streams_xattr' >>"/etc/samba/smb.conf"
RUN echo '   recycle:keeptree = yes' >>"/etc/samba/smb.conf"
RUN echo '   recycle:maxsize = 0' >>"/etc/samba/smb.conf"
RUN echo '   recycle:repository = .deleted' >>"/etc/samba/smb.conf"
RUN echo '   recycle:versions = yes' >>"/etc/samba/smb.conf"
RUN echo '' >>"/etc/samba/smb.conf"
RUN echo '   # Security' >>"/etc/samba/smb.conf"
RUN echo '   client ipc max protocol = SMB3' >>"/etc/samba/smb.conf"
RUN echo '   client ipc min protocol = SMB2_10' >>"/etc/samba/smb.conf"
RUN echo '   client max protocol = SMB3' >>"/etc/samba/smb.conf"
RUN echo '   client min protocol = SMB2_10' >>"/etc/samba/smb.conf"
RUN echo '   server max protocol = SMB3' >>"/etc/samba/smb.conf"
RUN echo '   server min protocol = SMB2_10' >>"/etc/samba/smb.conf"
RUN echo '' >>"/etc/samba/smb.conf"
RUN echo '   # Time Machine' >>"/etc/samba/smb.conf"
RUN echo '   fruit:delete_empty_adfiles = yes' >>"/etc/samba/smb.conf"
RUN echo '   fruit:time machine = yes' >>"/etc/samba/smb.conf"
RUN echo '   fruit:veto_appledouble = no' >>"/etc/samba/smb.conf"
RUN echo '   fruit:wipe_intentionally_left_blank_rfork = yes' >>"/etc/samba/smb.conf"
RUN echo '' >>"/etc/samba/smb.conf"
RUN rm -rf /tmp/*

COPY src/samba.sh /usr/bin/
COPY src/reset-perms.sh /usr/bin/

EXPOSE 137/udp 138/udp 139 445

HEALTHCHECK --interval=60s --timeout=15s \
    CMD smbclient -L \\localhost -U % -m SMB3

VOLUME ["/etc", "/var/cache/samba", "/var/lib/samba", "/var/log/samba", "/run/samba"]

ENTRYPOINT ["/sbin/tini", "--", "/usr/bin/samba.sh"]
